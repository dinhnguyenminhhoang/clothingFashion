"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const brandController = require("../controller/brand.controller");
const router = express.Router();

router.post("/brand", asynchandler(brandController.createNewBrand));

router.put("/brand/:id", asynchandler(brandController.updateBrand));

router.get("/brand", asynchandler(brandController.getALlbrand));

router.delete("/brand/:id", asynchandler(brandController.deleteBrand));

module.exports = router;
