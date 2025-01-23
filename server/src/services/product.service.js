"use strict";

const { default: mongoose } = require("mongoose");
const { Brand } = require("../models/brand.model");
const { Product } = require("../models/product.model");
const { paginate } = require("../utils/paginate");
const { NotFoundError } = require("../core/error.response");

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
  static deleteProduct = async (productId) => {
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) throw new Error("Product not found.");
    return await Product.findOneAndUpdate(
      { _id: productId },
      { productStatus: "inActive" }
    ).lean();
  };
  static getAllProducts = async (query) => {
    const {
      page = 1,
      limit = 6,
      sortBy,
      priceRange,
      status,
      categories: productType,
      filters = { productStatus: "active" },
      searchText,
    } = query;

    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split(",").map(Number);
      filters.price = { $gte: minPrice, $lte: maxPrice };
    }

    if (status) {
      const stockArray = status.split(",");
      filters.status = { $in: stockArray };
    }

    if (productType) {
      const categoryArray = productType.split(",");
      filters.productType = { $in: categoryArray };
    }
    const options = {};
    if (sortBy) {
      const [field, order] = sortBy.split("-");
      options.sort = { [field]: order === "asc" ? 1 : -1 };
    } else {
      options.sort = { createdAt: -1 };
    }
    let products = await paginate({
      model: Product,
      populate: ["reviews", "brand"],
      limit: +limit,
      page: +page,
      filters,
      options,
      searchText,
      searchFields: ["title", "description"],
    });
    const productData = products.data.map((product) => {
      const avgReview =
        product.reviews.length > 0
          ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
            product.reviews.length
          : 0;

      return {
        ...product,
        avgReview,
      };
    });
    products = {
      meta: products.meta,
      data: productData,
    };
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
    let products = await Product.find({
      productType: type,
      productStatus: "active",
    })
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
      productStatus: "active",
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
        avgReview: averageRating,
      };
    });

    topRatedProducts.sort((a, b) => b.rating - a.rating);

    return topRatedProducts;
  };
  static getProductQuantities = async (productId) => {
    const product = await Product.findOne({ _id: productId });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return product.enteredQuantity.map((entry) => {
      const sizeDetails = product.sizes.find(
        (size) => size.size === entry.size
      );
      return {
        _id: entry._id,
        quantity: entry.quantity,
        note: entry.note,
        size: sizeDetails ? sizeDetails : null,
      };
    });
  };

  static getProductSizes = async (productId) => {
    const product = await Product.findOne({ _id: productId });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return product?.sizes;
  };
  static createProductQuantities = async (productId, payload) => {
    const product = await Product.findOne({ _id: productId });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Cập nhật số lượng trong mảng sizes tương ứng với size nhập vào
    const sizeIndex = product.sizes.findIndex(
      (size) => size._id.toString() === payload.size.toString()
    );
    // Thêm thông tin nhập hàng vào enteredQuantity
    product.enteredQuantity.push({
      quantity: payload.quantity,
      note: payload.note,
      size: product.sizes[sizeIndex].size, // size sẽ là ObjectId liên kết với size trong mảng sizes
    });

    if (sizeIndex !== -1) {
      // Tăng quantity cho size tương ứng
      product.sizes[sizeIndex].quantity += Number(payload.quantity);
    } else {
      throw new NotFoundError("Size not found");
    }
    await product.save();
    return product;
  };
}
module.exports = ProductService;
