"use strict";

const { NotFoundError } = require("../core/error.response");
const { Brand } = require("../models/brand.model");
const { Order } = require("../models/order.model");
const { Product } = require("../models/product.model");
const { User } = require("../models/user.model");

class SummaryService {
  static getTotalSumary = async () => {
    const [countUser, countOrder, countProduct, countBrand] = await Promise.all(
      [
        User.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments(),
        Brand.countDocuments(),
      ]
    );

    const items = [
      { title: "Tống số người dùng", count: countUser },
      { title: "Tổng số đơn hàng", count: countOrder },
      { title: "Tổng số sản phẩm", count: countProduct },
      { title: "Tổng số Nhãn hàng", count: countBrand },
    ];
    return items;
  };

  static getSummaryByType = async (model, type) => {
    const currentDate = new Date();

    let groupFormat;
    let startDate;
    let dateRange = [];

    if (type === "day") {
      startDate = new Date();
      startDate.setDate(currentDate.getDate() - 29); // 30 ngày gần nhất
      groupFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };

      // Tạo danh sách 30 ngày gần nhất
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dateRange.push(date.toISOString().split("T")[0]); // Format YYYY-MM-DD
      }
    } else if (type === "month") {
      startDate = new Date();
      startDate.setMonth(currentDate.getMonth() - 11); // 12 tháng gần nhất
      groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };

      // Tạo danh sách 12 tháng gần nhất
      for (let i = 0; i < 12; i++) {
        const date = new Date(startDate);
        date.setMonth(startDate.getMonth() + i);
        dateRange.push(date.toISOString().substring(0, 7)); // Format YYYY-MM
      }
    } else {
      throw new NotFoundError("Invalid type. Use 'day' or 'month'.");
    }

    const summary = await model.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Map kết quả vào khung ngày/tháng
    const result = dateRange.map((date) => {
      const found = summary.find((entry) => entry._id === date);
      return {
        time: date,
        count: found ? found.count : 0,
      };
    });

    return result;
  };

  static getUserSummary = async (type) => {
    return await this.getSummaryByType(User, type);
  };

  static getOrderSummary = async (type) => {
    return await this.getSummaryByType(Order, type);
  };

  static getProductSummary = async (type) => {
    return await this.getSummaryByType(Product, type);
  };

  static getBrandSummary = async (type) => {
    return await this.getSummaryByType(Brand, type);
  };

  static getRevenueSummary = async (type) => {
    const currentDate = new Date();
    let groupFormat;
    let startDate;
    let dateRange = [];

    if (type === "day") {
      startDate = new Date();
      startDate.setDate(currentDate.getDate() - 29);
      groupFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dateRange.push(date.toISOString().split("T")[0]);
      }
    } else if (type === "month") {
      startDate = new Date();
      startDate.setMonth(currentDate.getMonth() - 11);
      groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
      for (let i = 0; i < 12; i++) {
        const date = new Date(startDate);
        date.setMonth(startDate.getMonth() + i);
        dateRange.push(date.toISOString().substring(0, 7));
      }
    } else {
      throw new NotFoundError("Invalid type. Use 'day' or 'month'.");
    }

    const summary = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: "cancel" }, // Exclude cancelled orders
        },
      },
      {
        $group: {
          _id: groupFormat,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const result = dateRange.map((date) => {
      const found = summary.find((entry) => entry._id === date);
      return {
        time: date,
        value: found ? found.totalRevenue : 0,
      };
    });

    return result;
  };

  static getOrderStatusSummary = async () => {
    const summary = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    return summary.map(item => ({ status: item._id, count: item.count }));
  };

  static getTopSellingProducts = async (limit = 5) => {
    const summary = await Order.aggregate([
      { $match: { status: { $ne: "cancel" } } },
      { $unwind: "$cart" },
      {
        $group: {
          _id: "$cart.product._id",
          name: { $first: "$cart.product.title" },
          price: { $first: "$cart.product.price" },
          image: { $first: { $arrayElemAt: ["$cart.product.images", 0] } },
          totalSold: { $sum: "$cart.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);
    return summary;
  };

  static getRecentOrders = async (limit = 5) => {
    return await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("_id recipientName totalAmount status createdAt")
      .lean();
  };
}

module.exports = { SummaryService };
