"use strict";

const { default: mongoose } = require("mongoose");
const { Brand } = require("../models/brand.model");
const { Product } = require("../models/product.model");

class ProductService {
  static createNewProduct = async (data) => {
    const product = await Product.create(data);
    const { _id: productId, brand } = product;
    const brandId = new mongoose.Types.ObjectId(brand);
    await Brand.updateOne({ _id: brandId }, { $push: { products: productId } });
    return product;
  };
  static updateProduct = async (productId, data) => {
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) throw new Error("Product not found.");
    const newBrandId = new mongoose.Types.ObjectId(data.brand);
    const productObjectId = new mongoose.Types.ObjectId(productId);
    if (newBrandId !== existingProduct.brand) {
      const oldBrandId = new mongoose.Types.ObjectId(existingProduct.brand);
      await Brand.updateOne(
        { _id: oldBrandId },
        { $pull: { products: productObjectId } }
      );
      await Brand.updateOne(
        { _id: newBrandId },
        { $push: { products: productObjectId } }
      );
    }
    return await Product.findOneAndUpdate(
      { _id: productId },
      { ...data }
    ).lean();
  };

  static getAllProducts = async () => {
    const products = await Product.find({}).populate("reviews");
    return products;
  };
  static getProductDetail = async (productId) => {
    const product = await Product.findOne({ _id: productId }).populate([
      "reviews",
      "brand",
    ]);

    if (!product) {
      throw new Error("Product not found");
    }

    const avgReview =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
          product.reviews.length
        : 0;

    return {
      ...product.toObject(),
      avgReview,
    };
  };
  static getProductType = async (type, query) => {
    const { limit } = query;
    let products = await Product.find({ productType: type })
      .populate("reviews")
      .limit(limit || 8);
    products = products.map((product) => {
      const avgReview =
        product.reviews.length > 0
          ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
            product.reviews.length
          : 0;

      return {
        ...product.toObject(),
        avgReview,
      };
    });

    return products;
  };

  static getTopRatedProduct = async () => {
    const products = await Product.find({
      reviews: { $exists: true, $ne: [] },
    }).populate("reviews");

    const topRatedProducts = products.map((product) => {
      const totalRating = product.reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating = totalRating / product.reviews.length;

      return {
        ...product.toObject(),
        rating: averageRating,
      };
    });

    topRatedProducts.sort((a, b) => b.rating - a.rating);

    return topRatedProducts;
  };
}
module.exports = ProductService;
