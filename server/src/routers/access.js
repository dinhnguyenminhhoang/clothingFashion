"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const accessController = require("../controller/access.controller");
const router = express.Router();
// signUp
router.post("/register", asynchandler(accessController.singUp));

//signIn
router.post("/login", asynchandler(accessController.login));

module.exports = router;
