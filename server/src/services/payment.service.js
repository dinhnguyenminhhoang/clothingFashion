"use strict";

const { createChecksum } = require("../utils");

class PaymentService {
  static payment = async (req) => {
    const orderInfo = req.body.orderInfo;
    const orderType = req.body.orderType;
    const amount = req.body.amount;
    const bankCode = req.body.bankCode;
    const language = req.body.language || "vn";
    const ipAddr =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const date = new Date();
    const createDate = `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}${date
      .getHours()
      .toString()
      .padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}${date
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    const vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: process.env.VNP_TMNCODE,
      vnp_Amount: amount * 100,
      vnp_CreateDate: createDate,
      vnp_CurrCode: "VND",
      vnp_IpAddr: ipAddr,
      vnp_Locale: language,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: orderType,
      vnp_ReturnUrl: "http://localhost:3000/vnpay_return",
      vnp_TxnRef: Math.floor(Math.random() * 1000000000).toString(),
      vnp_BankCode: bankCode,
    };

    vnp_Params["vnp_SecureHash"] = createChecksum(vnp_Params);

    return `${process.env.VNP_URL}?${new URLSearchParams(
      vnp_Params
    ).toString()}`;
  };
}
module.exports = PaymentService;
