"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const { authentication } = require("../auth/authUtils");
const accessController = require("../controller/access.controller");
const router = express.Router();

router.post("/payment", asynchandler(accessController.payment));
module.exports = router;
