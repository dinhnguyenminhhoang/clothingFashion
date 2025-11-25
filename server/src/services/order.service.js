"use strict";

const {
  ForbiddenError,
  NotFoundError,
  conflictRequestError,
  badRequestError,
} = require("../core/error.response");
const sendEmail = require("../helpers/sendEmail");
const { Order } = require("../models/order.model");
const { Product } = require("../models/product.model");
const {
  confirmOrderForm,
  processingOrderForm,
  deliveredOrderForm,
  cancelOrderForm,
} = require("../utils/emailExtension");
const { paginate } = require("../utils/paginate");
const VoucherService = require("./voucher.service");

class OrderService {
  static createNewOrder = async (payload, user) => {
    if (!user) throw new ForbiddenError("User not found");

    let voucherDiscount = 0;
    let voucherData = null;

    // Apply voucher if provided
    if (payload.voucherCode) {
      try {
        const validation = await VoucherService.validateVoucher(
          payload.voucherCode,
          {
            totalAmount: payload.totalAmount,
            products: payload.cart.map(item => ({
              _id: item.product
            }))
          }
        );

        voucherDiscount = validation.discount;
        voucherData = {
          code: validation.voucher.code,
          discount: voucherDiscount,
          voucherId: validation.voucher._id,
        };
      } catch (error) {
        throw new badRequestError(error.message || "Invalid voucher");
      }
    }

    // Calculate estimated delivery (3 business days)
    const calculateEstimatedDelivery = () => {
      const now = new Date();
      const deliveryDays = 3;
      const estimated = new Date(now);
      estimated.setDate(estimated.getDate() + deliveryDays);
      return estimated;
    };

    // Tạo đơn hàng
    const order = await Order.create({
      user: user.userId,
      address: payload.address,
      phone: payload.phone,
      recipientName: payload.recipientName,
      paymentMethod: payload.paymentMethod || "cash",
      cart: payload.cart,
      totalAmount: payload.totalAmount,
      voucher: voucherData,
      finalAmount: payload.totalAmount - voucherDiscount,
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Đơn hàng đã được đặt thành công",
        },
      ],
      estimatedDelivery: calculateEstimatedDelivery(),
    });

    if (!order) throw new Error("Order creation failed");

    // Kiểm tra và cập nhật sản phẩm
    for (const item of payload.cart) {
      const productId = item.product;
      const quantity = item.quantity;
      const size = item.size;

      const product = await Product.findById(productId);

      if (product) {
        const sizesObj = product.sizes?.find(
          (sizesObj) => sizesObj.size === size
        );
        if (!sizesObj || sizesObj?.quantity < quantity) {
          throw new badRequestError(
            `Not enough stock for product: ${product.title}`
          );
        }

        // Cập nhật số lượng và số lượng đã bán
        await Product.findByIdAndUpdate(
          productId,
          {
            $inc: { quantity: -quantity, sellCount: quantity }, // Cập nhật số lượng tổng và số lượng đã bán
            $set: {
              "sizes.$[elem].quantity": sizesObj.quantity - quantity, // Trừ số lượng của kích thước cụ thể
            },
          },
          {
            arrayFilters: [{ "elem.size": size }], // Cập nhật đúng kích thước trong mảng
          }
        );
      } else {
        throw new Error(`Product not found: ${productId}`);
      }
    }

    // Increment voucher usage if applied
    if (voucherData) {
      await VoucherService.applyVoucher(
        payload.voucherCode,
        user.userId,
        order._id,
        order.finalAmount
      );
    }

    const confirmOrder = confirmOrderForm(payload);
    await sendEmail(user.email, confirmOrder.title, confirmOrder.body);
    return order;
  };

  static updateStatus = async (orderId, payload, user) => {
    const existingOrder = await Order.findOne({
      _id: orderId,
      user: user.userId,
    }).populate("user");

    if (!existingOrder) throw new NotFoundError("Order not found");

    // Kiểm tra trạng thái đơn hàng
    if (existingOrder.status !== "pending" && payload.status === "canceled") {
      throw new ForbiddenError("Cannot cancel an already processed order");
    }

    // Nếu trạng thái chuyển thành "canceled", hoàn kho
    if (payload.status === "cancel") {
      for (const item of existingOrder.cart) {
        const productId = item.product;
        const quantity = item.quantity;
        const size = item.size;

        const product = await Product.findById(productId);
        if (product) {
          const sizesObj = product.sizes?.find(
            (sizesObj) => sizesObj.size === size
          );
          await Product.findByIdAndUpdate(
            productId,
            {
              $inc: { quantity: +quantity, sellCount: -quantity },
              $set: {
                "sizes.$[elem].quantity": sizesObj.quantity + quantity,
              },
            },
            {
              arrayFilters: [{ "elem.size": size }],
            }
          );
        } else {
          throw new Error(`Product not found: ${productId}`);
        }
      }
    }

    const updateOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: payload.status },
      { new: true }
    ).lean();
    if (payload.status === "cancel" && updateOrder) {
      const emailContent = cancelOrderForm(orderId, existingOrder);
      await sendEmail(
        existingOrder?.user?.email,
        emailContent.title,
        emailContent.body
      );
    }
    return updateOrder;
  };

  static adminUpdateStatus = async (orderId, payload) => {
    const existingOrder = await Order.findOne({ _id: orderId }).populate(
      "user"
    );
    if (!existingOrder) throw new NotFoundError("Order not found");

    const currentStatus = existingOrder.status;
    const newStatus = payload.status;

    const statusTransition = {
      pending: ["processing", "cancel"],
      processing: ["delivered"],
      vnpay: ["pending", "processing", "delivered"],
      delivered: [],
      cancel: [],
    };

    if (!statusTransition[currentStatus]?.includes(newStatus)) {
      throw new conflictRequestError(
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }
    if (payload.status === "cancel") {
      for (const item of existingOrder.cart) {
        const productId = item.product;
        const quantity = item.quantity;

        const product = await Product.findById(productId);
        if (product) {
          await Product.findByIdAndUpdate(
            productId,
            {
              $inc: { quantity: +quantity, sellCount: -quantity },
              $set: {
                "sizes.$[elem].quantity": sizesObj.quantity + quantity,
              },
            },
            {
              arrayFilters: [{ "elem.size": size }],
            }
          );
        } else {
          throw new Error(`Product not found: ${productId}`);
        }
      }
    }

    // Helper function for default notes
    const getDefaultNote = (status) => {
      const notes = {
        processing: "Đơn hàng đang được xử lý",
        delivered: "Đơn hàng đã giao thành công",
        cancel: "Đơn hàng đã bị hủy",
      };
      return notes[status] || "";
    };

    // Update order with status history
    existingOrder.status = newStatus;
    existingOrder.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      note: payload.note || getDefaultNote(newStatus),
    });

    const updateOrder = await existingOrder.save();
    if (!updateOrder) throw new NotFoundError("Order Not Found");
    let emailContent;
    switch (newStatus) {
      case "processing":
        emailContent = processingOrderForm(orderId, existingOrder);
        break;
      case "delivered":
        emailContent = deliveredOrderForm(orderId, existingOrder);
        break;
      case "cancel":
        emailContent = cancelOrderForm(orderId, existingOrder);
        break;
      default:
        throw new Error("Invalid status transition");
    }

    if (emailContent) {
      await sendEmail(
        existingOrder?.user?.email,
        emailContent.title,
        emailContent.body
      );
    }
  };

  static getOrderByUser = async (user) => {
    const orders = await Order.find({ user: user.userId })
      .sort({ createdAt: -1 })
      .populate("user", { userName: 1, email: 1, _id: 1, phone: 1 })
      .populate({
        path: "cart.product",
        model: "Product",
      });

    return orders;
  };
  static getAllOrder = async ({
    limit = 10,
    page = 1,
    filters,
    sortBy,
    ...query
  }) => {
    const options = {};
    if (sortBy) {
      const [field, order] = sortBy.split("-");
      options.sort = { [field]: order === "asc" ? 1 : -1 };
    } else {
      options.sort = { createdAt: -1 };
    }
    let orders = await paginate({
      model: Order,
      limit: +limit,
      page: +page,
      filters,
      options,
      populate: [
        {
          path: "user",
          select: "userName email _id phone",
        },
        {
          path: "cart.product",
        },
      ],
    });
    return orders;
  };
}

module.exports = OrderService;
