"use strict";

const express = require("express");
const discountController = require("../controller/discount.controller");
const { asyncHandler } = require("../helpers/asynchandler");
const { authentication, adminAuthentication } = require("../auth/authUtils");

const router = express.Router();

// Public routes - no authentication required
router.get("/active", discountController.getActiveDiscounts);
router.post("/calculate", discountController.calculateDiscount);

// Admin routes - require admin authentication
router.use(adminAuthentication);

router.post("/", discountController.createDiscount);
router.get("/", discountController.getAllDiscounts);
router.get("/:id", discountController.getDiscountById);
router.put("/:id", discountController.updateDiscount);
router.delete("/:id", discountController.deleteDiscount);
router.patch("/:id/toggle", discountController.toggleDiscountStatus);

module.exports = router;
