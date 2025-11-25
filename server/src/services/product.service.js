"use strict";

const { default: mongoose } = require("mongoose");
const { Brand } = require("../models/brand.model");
const { Product } = require("../models/product.model");
const { paginate } = require("../utils/paginate");
const { NotFoundError } = require("../core/error.response");
const { Category } = require("../models/category.model");
const DiscountService = require("./discount.service");

class ProductService {
  static createNewProduct = async (data) => {
    const product = await Product.create(data);
    const { _id: productId, brand, category } = product;
    const brandId = new mongoose.Types.ObjectId(brand);
    const categoryId = new mongoose.Types.ObjectId(category);
    await Brand.updateOne({ _id: brandId }, { $push: { products: productId } });
    await Category.updateOne(
      { _id: categoryId },
      { $push: { products: productId } }
    );
    return product;
  };

  static updateProduct = async (productId, data) => {
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) throw new Error("Product not found.");
    const newBrandId = new mongoose.Types.ObjectId(data.brand);
    const newCategoryId = new mongoose.Types.ObjectId(data.category);
    const productObjectId = new mongoose.Types.ObjectId(productId);
    if (!existingProduct.brand?.equals(newBrandId)) {
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

    if (!existingProduct.category?.equals(newCategoryId)) {
      const oldCategoryId = new mongoose.Types.ObjectId(
        existingProduct.category
      );
      await Category.updateOne(
        { _id: oldCategoryId },
        { $pull: { products: productObjectId } }
      );
      await Category.updateOne(
        { _id: newCategoryId },
        { $push: { products: productObjectId } }
      );
    }

    // Calculate sale price
    const price = data.price !== undefined ? Number(data.price) : existingProduct.price;
    const discount = data.discount !== undefined ? Number(data.discount) : existingProduct.discount;

    if (discount > 0) {
      data.salePrice = Math.round(price * (1 - discount / 100));
      data.isSale = true;
    } else {
      data.salePrice = price;
      data.isSale = false;
      data.discount = 0;
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
      filters = { productStatus: "active" },
      searchText,
      category,
    } = query;

    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split(",").map(Number);
      filters.price = { $gte: minPrice, $lte: maxPrice };
    }
    if (category) {
      const categoryArray = category
        .split(",")
        .map((id) => new mongoose.Types.ObjectId(id));
      filters.category = { $in: categoryArray };
    }
    if (status) {
      const stockArray = status.split(",");
      filters.status = { $in: stockArray };
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
      populate: ["reviews", "brand", "category"],
      limit: +limit,
      page: +page,
      filters,
      options,
      searchText,
      searchFields: ["title", "description"],
    });

    // Calculate discounts and avg reviews for each product
    const productData = await Promise.all(
      products.data.map(async (product) => {
        const avgReview =
          product.reviews.length > 0
            ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
            product.reviews.length
            : 0;

        // Get applicable discount
        const discount = await DiscountService.calculateDiscountForProduct(product._id);
        const salePrice = discount
          ? DiscountService.calculateSalePrice(product.price, discount)
          : product.price;

        return {
          ...product,
          avgReview,
          discount: discount ? {
            _id: discount._id,
            name: discount.name,
            percentage: discount.percentage,
            endDate: discount.endDate
          } : null,
          salePrice
        };
      })
    );

    products = {
      meta: products.meta,
      data: productData,
    };
    return products;
  };

  // Helper to add discount information to a product
  static addDiscountToProduct = async (product) => {
    const discount = await DiscountService.calculateDiscountForProduct(product._id);
    const salePrice = discount
      ? DiscountService.calculateSalePrice(product.price, discount)
      : product.price;

    return {
      ...product,
      discount: discount ? {
        _id: discount._id,
        name: discount.name,
        percentage: discount.percentage,
        endDate: discount.endDate
      } : null,
      salePrice
    };
  };

  static getProductDetail = async (productId) => {
    const product = await Product.findOne({ _id: productId })
      .populate({
        path: "reviews",
        populate: {
          path: "user",
          select: "userName avatar",
        },
      })
      .populate("brand")
      .populate("category")
      .lean();

    if (!product) {
      throw new Error("Product not found");
    }

    const avgReview =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        product.reviews.length
        : 0;

    // Apply discount
    const discount = await DiscountService.calculateDiscountForProduct(productId);
    const salePrice = discount
      ? DiscountService.calculateSalePrice(product.price, discount)
      : product.price;

    return {
      ...product,
      avgReview,
      discount: discount ? {
        _id: discount._id,
        name: discount.name,
        percentage: discount.percentage,
        description: discount.description,
        terms: discount.terms,
        endDate: discount.endDate
      } : null,
      salePrice
    };
  };

  static getProductType = async (type, query) => {
    const { limit } = query;
    const categories = await Category.find({
      name: { $regex: type, $options: "i" },
    });

    if (!categories.length) {
      return [];
    }

    const categoryIds = categories.map((category) => category._id);

    let products = await Product.find({
      category: { $in: categoryIds },
      productStatus: "active",
    })
      .populate("reviews")
      .limit(limit || 8)
      .lean();

    // Apply discount to each product
    const productsWithDiscount = await Promise.all(
      products.map(async (product) => {
        const avgReview =
          product.reviews.length > 0
            ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
            product.reviews.length
            : 0;

        const discount = await DiscountService.calculateDiscountForProduct(product._id);
        const salePrice = discount
          ? DiscountService.calculateSalePrice(product.price, discount)
          : product.price;

        return {
          ...product,
          avgReview,
          discount: discount ? {
            _id: discount._id,
            name: discount.name,
            percentage: discount.percentage,
            endDate: discount.endDate
          } : null,
          salePrice
        };
      })
    );

    return productsWithDiscount;
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

    topRatedProducts.sort((a, b) => b.avgReview - a.avgReview);

    return topRatedProducts.slice(0, 8);
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

    const sizeIndex = product.sizes.findIndex(
      (size) => size._id.toString() === payload.size.toString()
    );

    product.enteredQuantity.push({
      quantity: payload.quantity,
      note: payload.note,
      size: product.sizes[sizeIndex].size,
    });

    if (sizeIndex !== -1) {
      product.sizes[sizeIndex].quantity += Number(payload.quantity);
    } else {
      throw new NotFoundError("Size not found");
    }
    await product.save();
    return product;
  };

  // NEW METHODS
  static getNewArrivals = async (limit = 8) => {
    let products = await Product.find({
      productStatus: "active",
    })
      .populate(["reviews", "brand", "category"])
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Add discount to each product
    const productsWithDiscount = await Promise.all(
      products.map(async (product) => {
        const discount = await DiscountService.calculateDiscountForProduct(product._id);
        const salePrice = discount
          ? DiscountService.calculateSalePrice(product.price, discount)
          : product.price;

        return {
          ...product,
          avgReview:
            product.reviews.length > 0
              ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
              product.reviews.length
              : 0,
          discount: discount ? {
            _id: discount._id,
            name: discount.name,
            percentage: discount.percentage,
            endDate: discount.endDate
          } : null,
          salePrice
        };
      })
    );

    return productsWithDiscount;
  };

  static getBestSellers = async (limit = 8) => {
    let products = await Product.find({
      productStatus: "active",
    })
      .populate(["reviews", "brand", "category"])
      .sort({ sold: -1 })
      .limit(limit)
      .lean();

    // Add discount to each product
    const productsWithDiscount = await Promise.all(
      products.map(async (product) => {
        const discount = await DiscountService.calculateDiscountForProduct(product._id);
        const salePrice = discount
          ? DiscountService.calculateSalePrice(product.price, discount)
          : product.price;

        return {
          ...product,
          avgReview:
            product.reviews.length > 0
              ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
              product.reviews.length
              : 0,
          discount: discount ? {
            _id: discount._id,
            name: discount.name,
            percentage: discount.percentage,
            endDate: discount.endDate
          } : null,
          salePrice
        };
      })
    );

    return productsWithDiscount;
  };

  static getFeaturedProducts = async (limit = 8) => {
    const products = await Product.find({
      productStatus: "active",
      reviews: { $exists: true, $ne: [] },
    })
      .populate(["reviews", "brand", "category"])
      .lean();

    const maxSellCount = Math.max(
      ...products.map((p) => p.sellCount || 0),
      1
    );

    const featuredProducts = products
      .map((product) => {
        const avgReview =
          product.reviews.length > 0
            ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
            product.reviews.length
            : 0;

        const normalizedSellCount = (product.sellCount || 0) / maxSellCount;
        const score = avgReview * 0.7 + normalizedSellCount * 5 * 0.3;

        return { ...product, avgReview, featuredScore: score };
      })
      .sort((a, b) => b.featuredScore - a.featuredScore)
      .slice(0, limit);

    return featuredProducts;
  };

  static getHomepageData = async () => {
    const [
      newArrivals,
      bestSellers,
      topRated,
      featuredProducts,
      categories,
      brands,
    ] = await Promise.all([
      this.getNewArrivals(8),
      this.getBestSellers(8),
      this.getTopRatedProduct(),
      this.getFeaturedProducts(8),
      Category.find({ status: "active" }).limit(10).lean(),
      Brand.find({ status: "active" }).limit(10).lean(),
    ]);

    const productsByCategory = await Promise.all(
      categories.slice(0, 3).map(async (category) => {
        const products = await Product.find({
          category: category._id,
          productStatus: "active",
        })
          .populate(["reviews", "brand"])
          .limit(4)
          .lean();

        const productsWithDiscount = await Promise.all(
          products.map(async (product) => {
            const discount = await DiscountService.calculateDiscountForProduct(product._id);
            const salePrice = discount
              ? DiscountService.calculateSalePrice(product.price, discount)
              : product.price;

            return {
              ...product,
              avgReview:
                product.reviews.length > 0
                  ? product.reviews.reduce(
                    (acc, review) => acc + review.rating,
                    0
                  ) / product.reviews.length
                  : 0,
              discount: discount ? {
                _id: discount._id,
                name: discount.name,
                percentage: discount.percentage,
                endDate: discount.endDate
              } : null,
              salePrice
            };
          })
        );

        return { category, products: productsWithDiscount };
      })
    );

    return {
      newArrivals,
      bestSellers,
      topRated: topRated.slice(0, 8),
      featuredProducts,
      productsByCategory,
      categories,
      brands,
      stats: {
        totalProducts: await Product.countDocuments({
          productStatus: "active",
        }),
        totalCategories: categories.length,
        totalBrands: brands.length,
      },
    };
  };

  static getRelatedProducts = async (productId, limit = 4) => {
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      throw new NotFoundError("Product not found");
    }

    let products = await Product.find({
      _id: { $ne: productId },
      $or: [
        { category: currentProduct.category },
        { brand: currentProduct.brand },
      ],
      productStatus: "active",
    })
      .populate(["reviews", "brand", "category"])
      .limit(limit)
      .lean();

    return products.map((product) => ({
      ...product,
      avgReview:
        product.reviews.length > 0
          ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
          product.reviews.length
          : 0,
    }));
  };
}

module.exports = ProductService;