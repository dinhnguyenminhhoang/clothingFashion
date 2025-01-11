"use strict";

const {
  ForbiddenError,
  NotFoundError,
  conflictRequestError,
} = require("../core/error.response");
const { Order } = require("../models/order.model");
const { Product } = require("../models/product.model");
const { paginate } = require("../utils/paginate");

class OrderService {
  static createNewOrder = async (payload, user) => {
    if (!user) throw new ForbiddenError("User not found");

    // Tạo đơn hàng
    const order = await Order.create({
      user: user.userId,
      address: payload.address,
      phone: payload.phone,
      recipientName: payload.recipientName,
      paymentMethod: payload.paymentMethod || "cash",
      cart: payload.cart,
      totalAmount: payload.totalAmount,
    });

    if (!order) throw new Error("Order creation failed");

    // Kiểm tra và cập nhật sản phẩm
    for (const item of payload.cart) {
      const productId = item.product;
      const quantity = item.quantity;

      const product = await Product.findById(productId);

      if (product) {
        // Kiểm tra tồn kho
        if (product.quantity < quantity) {
          throw new Error(`Not enough stock for product: ${product.title}`);
        }

        // Cập nhật số lượng và số lượng đã bán
        await Product.findByIdAndUpdate(productId, {
          $inc: { quantity: -quantity, sellCount: quantity },
        });
      } else {
        throw new Error(`Product not found: ${productId}`);
      }
    }

    return order;
  };

  static updateStatus = async (orderId, payload, user) => {
    const existingOrder = await Order.findOne({
      _id: orderId,
      user: user.userId,
    });

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

        const product = await Product.findById(productId);
        if (product) {
          console.log("product", product);
          await Product.findByIdAndUpdate(productId, {
            $inc: { quantity: +quantity, sellCount: -quantity },
          });
        } else {
          throw new Error(`Product not found: ${productId}`);
        }
      }
    }

    // Cập nhật trạng thái đơn hàng
    return await Order.findByIdAndUpdate(
      orderId,
      { status: payload.status },
      { new: true }
    ).lean();
  };

  static adminUpdateStatus = async (orderId, payload) => {
    const existingOrder = await Order.findOne({ _id: orderId });

    if (!existingOrder) throw new NotFoundError("Order not found");

    const currentStatus = existingOrder.status;
    const newStatus = payload.status;

    const statusTransition = {
      pending: ["processing", "cancel"],
      processing: ["delivered"],
      delivered: [],
      cancel: [],
    };

    if (!statusTransition[currentStatus].includes(newStatus)) {
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
          await Product.findByIdAndUpdate(productId, {
            $inc: { quantity: +quantity, sellCount: -quantity },
          });
        } else {
          throw new Error(`Product not found: ${productId}`);
        }
      }
    }
    return await Order.findByIdAndUpdate(
      orderId,
      { status: newStatus },
      { new: true }
    ).lean();
  };

  static getOrderByUser = async (user) => {
    const orders = await Order.find({ user: user.userId })
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
    options,
    ...query
  }) => {
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
