"use strict";

const { SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");
const PaymentService = require("../services/payment.service");

class AccessController {
  payment = async (req, res, next) => {
    new SuccessResponse({
      data: await PaymentService.payment(req),
    }).send(res);
  };
  vnpay_ipn = async (req, res, next) => {
    new SuccessResponse({
      data: await PaymentService.vnpay_ipn(req),
    }).send(res);
  };
  vnpay_return = async (req, res, next) => {
    new SuccessResponse({
      data: await PaymentService.vnpay_return(req),
    }).send(res);
  };
}
module.exports = new AccessController();
