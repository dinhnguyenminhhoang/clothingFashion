"use strict";

const { default: mongoose } = require("mongoose");
const {
  NotFoundError,
  conflictRequestError,
} = require("../core/error.response");
const { Brand } = require("../models/brand.model");
const { Review } = require("../models/review.model");
const { Order } = require("../models/order.model");
const { Product } = require("../models/product.model");
const { User } = require("../models/user.model");

class ReviewService {
  static createNewReview = async (data) => {
    const { userId, productId, rating, comment } = data;
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });

    if (existingReview)
      throw new conflictRequestError(
        "You have already left a review for this product."
      );

    const checkPurchase = await Order.findOne({
      user: new mongoose.Types.ObjectId(userId),
      "cart._id": { $in: [productId] },
    });
    if (!checkPurchase)
      throw new conflictRequestError(
        "Without purchase you can not give here review."
      );

    const review = await Review.create(data);

    const product = await Product.findById(productId);
    product.reviews.push(review._id);
    await product.save();

    const user = await User.findById(userId);
    user.reviews.push(review._id);
    await user.save();
    return user;
  };
  static deleteReview = async (productId) => {
    const result = await Review.deleteMany({ productId: productId });
    if (result.deletedCount === 0)
      throw new NotFoundError("Product reviews not found");
    return "All reviews deleted for the product";
  };
}
module.exports = ReviewService;
