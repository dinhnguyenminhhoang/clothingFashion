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
  static getProductType = async (type, query) => {
    let products;
    if (query.new === "true") {
      products = await Product.find({ productType: type })
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("reviews");
    } else if (query.topSellers === "true") {
      products = await Product.find({ productType: type })
        .sort({ sellCount: -1 })
        .limit(8)
        .populate("reviews");
    } else {
      products = await Product.find({ productType: type }).populate("reviews");
    }
    return products;
  };
  static getPopularProductByType = async (type) => {
    const products = await Product.find({ productType: type })
      .sort({ "reviews.length": -1 })
      .limit(8)
      .populate("reviews");
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
