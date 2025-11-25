"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const { adminAuthentication } = require("../auth/authUtils");
const summaryController = require("../controller/summary.controller");

const router = express.Router();

router.get(
  "/summary/total",
  adminAuthentication,
  asynchandler(summaryController.getTotalSumary)
);

router.get(
  "/summary/user/:type",
  adminAuthentication,
  asynchandler(summaryController.getUserSummary)
);

router.get(
  "/summary/brand/:type",
  adminAuthentication,
  asynchandler(summaryController.getBrandSummary)
);

router.get(
  "/summary/product/:type",
  adminAuthentication,
  asynchandler(summaryController.getProductSummary)
);

router.get(
  "/summary/order/:type",
  adminAuthentication,
  asynchandler(summaryController.getOrderSummary)
);

router.get(
  "/summary/revenue/:type",
  adminAuthentication,
  asynchandler(summaryController.getRevenueSummary)
);

router.get(
  "/summary/order-status",
  adminAuthentication,
  asynchandler(summaryController.getOrderStatusSummary)
);

router.get(
  "/summary/top-products",
  adminAuthentication,
  asynchandler(summaryController.getTopSellingProducts)
);

router.get(
  "/summary/recent-orders",
  adminAuthentication,
  asynchandler(summaryController.getRecentOrders)
);

module.exports = router;