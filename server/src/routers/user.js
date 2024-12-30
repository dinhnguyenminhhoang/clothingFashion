"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const accessController = require("../controller/access.controller");
const router = express.Router();
// signUp
router.post("/profile", asynchandler(accessController.singUp));

module.exports = router;
