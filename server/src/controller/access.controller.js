"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  login = async (req, res, next) => {
    new SuccessResponse({
      data: await AccessService.login(req.body),
    }).send(res);
  };
  singUp = async (req, res, next) => {
    new CREATED({
      message: "Register OK!",
      data: await AccessService.singUp(req.body),
    }).send(res);
  };
  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "logout successfully",
      data: await AccessService.Logout({ keyStore: req.keyStore }),
    }).send(res);
  };
}
module.exports = new AccessController();
