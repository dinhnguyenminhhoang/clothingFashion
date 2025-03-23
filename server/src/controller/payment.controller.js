"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");
const PaymentService = require("../services/payment.service");

class PaymentController {
  payment = async (req, res, next) => {
    new SuccessResponse({
      data: await PaymentService.payment(req),
    }).send(res);
  };
}
module.exports = new PaymentController();
