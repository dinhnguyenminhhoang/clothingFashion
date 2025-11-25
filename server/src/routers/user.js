"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const userController = require("../controller/user.controller");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const router = express.Router();

router.get(
  "/profile",
  authentication,
  asynchandler(userController.getUserInfo)
);

router.post(
  "/profile",
  authentication,
  asynchandler(userController.updateProfile)
);

router.post(
  "/address",
  authentication,
  asynchandler(userController.addAddress)
);

router.get(
  "/address",
  authentication,
  asynchandler(userController.getAddresses)
);

router.put(
  "/address/:addressId",
  authentication,
  asynchandler(userController.updateAddress)
);

router.delete(
  "/address/:addressId",
  authentication,
  asynchandler(userController.deleteAddress)
);

router.get(
  "/user",
  adminAuthentication,
  asynchandler(userController.getAllUser)
);

router.delete(
  "/user/:userId",
  adminAuthentication,
  asynchandler(userController.deleteUser)
);

router.post(
  "/user",
  adminAuthentication,
  asynchandler(userController.createUser)
);

router.put(
  "/user/:userId",
  adminAuthentication,
  asynchandler(userController.updateUser)
);

module.exports = router;