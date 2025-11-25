"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const reviewController = require("../controller/review.controller");
const { authentication } = require("../auth/authUtils");
const router = express.Router();

router.post(
  "/review",
  authentication,
  asynchandler(reviewController.createNewReview)
);

router.delete("/review/:id", asynchandler(reviewController.deleteReview));

router.get(
  "/review/high-rated",
  asynchandler(reviewController.getHighRatedReviews)
);

module.exports = router;