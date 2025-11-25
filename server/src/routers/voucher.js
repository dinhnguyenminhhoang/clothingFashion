"use strict";

const router = require("express").Router();
const voucherController = require("../controller/voucher.controller");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const { asynchandler } = require("../helpers/asynchandler");

/**
 * @swagger
 * tags:
 *   name: Vouchers
 *   description: Voucher management
 */

// Admin routes
router.post(
    "/",
    adminAuthentication,
    asynchandler(voucherController.createVoucher)
);

router.get(
    "/admin",
    adminAuthentication,
    asynchandler(voucherController.getAllVouchers)
);

router.get(
    "/:id",
    adminAuthentication,
    asynchandler(voucherController.getVoucherById)
);

router.put(
    "/:id",
    adminAuthentication,
    asynchandler(voucherController.updateVoucher)
);

router.delete(
    "/:id",
    adminAuthentication,
    asynchandler(voucherController.deleteVoucher)
);

// User routes
router.post(
    "/validate",
    authentication,
    asynchandler(voucherController.validateVoucher)
);

router.get("/active", asynchandler(voucherController.getActiveVouchers));

module.exports = router;
