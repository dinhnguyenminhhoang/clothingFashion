"use strict";
const express = require("express");
const router = express.Router();

// Authentication routes
router.use(`/v1/api`, require("./access"));

// Resource routes
router.use(`/v1/api`, require("./brand"));
router.use(`/v1/api`, require("./category"));
router.use(`/v1/api`, require("./product"));
router.use(`/v1/api`, require("./review"));
router.use(`/v1/api`, require("./order"));
router.use(`/v1/api`, require("./user"));
router.use(`/v1/api`, require("./report"));
router.use(`/v1/api/favorite`, require("./favorite"));
router.use(`/v1/api/voucher`, require("./voucher"));
router.use(`/v1/api/discounts`, require("./discount"));

// Payment routes
router.use(`/v1/api`, require("./payment"));

// Utility routes
router.use(`/v1/api`, require("./summary"));
router.use(`/v1/api`, require("./upload"));
router.use(`/v1/api`, require("./docxSwapper"));

module.exports = router;