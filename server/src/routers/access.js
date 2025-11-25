"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const accessController = require("../controller/access.controller");
const { authentication } = require("../auth/authUtils");
const router = express.Router();

router.post("/register", asynchandler(accessController.singUp));

router.post("/verify-account", asynchandler(accessController.verifyAccount));

router.post(
  "/resend-verification-code",
  asynchandler(accessController.resendVerificationCode)
);

router.post("/login", asynchandler(accessController.login));

router.post("/forgot-password", asynchandler(accessController.forgotPassword));

router.post(
  "/verify-reset-code",
  asynchandler(accessController.verifyResetCode)
);

router.post("/reset-password", asynchandler(accessController.resetPassword));

router.post(
  "/confirm-account",
  authentication,
  asynchandler(accessController.confirmAccount)
);

module.exports = router;