"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const reviewController = require("../controller/review.controller");
const router = express.Router();

router.post("/review", asynchandler(reviewController.createNewReview));

router.delete("/review/:id", asynchandler(reviewController.deleteReview));

module.exports = router;
