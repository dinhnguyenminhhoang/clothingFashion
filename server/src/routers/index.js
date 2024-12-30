"use strict";
const express = require("express");
const router = express.Router();

router.use(`/v1/api`, require("./access"));
router.use(`/v1/api`, require("./brand"));
router.use(`/v1/api`, require("./product"));
router.use(`/v1/api`, require("./review"));
router.use(`/v1/api`, require("./order"));
router.use(`/v1/api`, require("./user"));

module.exports = router;
