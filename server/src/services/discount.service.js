"use strict";

const { Discount, DISCOUNT_TYPES } = require("../models/discount.model");
const { Product } = require("../models/product.model");
const { BadRequestError, NotFoundError } = require("../core/error.response");

class DiscountService {
    /**
     * Create a new discount
     * @param {Object} discountData - Discount data
     * @returns {Promise<Object>} Created discount
     */
    static async createDiscount(discountData) {
        // Validate discount data based on type
        const { discountType, product, brand, category, products, percentage, startDate, endDate } = discountData;

        // Validate percentage
        if (percentage < 0 || percentage > 100) {
            throw new BadRequestError("Percentage must be between 0 and 100");
        }

        // Validate dates
        if (endDate && new Date(endDate) <= new Date(startDate)) {
            throw new BadRequestError("End date must be after start date");
        }

        // Type-specific validation
        switch (discountType) {
            case DISCOUNT_TYPES.PRODUCT:
                if (!product) {
                    throw new BadRequestError("Product reference is required for PRODUCT discount type");
                }
                // Check if product exists
                const productExists = await Product.findById(product);
                if (!productExists) {
                    throw new NotFoundError("Product not found");
                }
                break;

            case DISCOUNT_TYPES.PRODUCT_LIST:
                if (!products || products.length === 0) {
                    throw new BadRequestError("Products array is required for PRODUCT_LIST discount type");
                }
                // Optionally validate all products exist
                break;

            case DISCOUNT_TYPES.BRAND:
                if (!brand) {
                    throw new BadRequestError("Brand reference is required for BRAND discount type");
                }
                break;

            case DISCOUNT_TYPES.CATEGORY:
                if (!category) {
                    throw new BadRequestError("Category reference is required for CATEGORY discount type");
                }
                break;

            case DISCOUNT_TYPES.GLOBAL:
                // No additional validation needed
                break;

            default:
                throw new BadRequestError("Invalid discount type");
        }

        const discount = await Discount.create(discountData);
        return discount;
    }

    /**
     * Update a discount
     * @param {String} discountId - Discount ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated discount
     */
    static async updateDiscount(discountId, updateData) {
        const discount = await Discount.findById(discountId);
        if (!discount) {
            throw new NotFoundError("Discount not found");
        }

        // Validate dates if being updated
        if (updateData.endDate || updateData.startDate) {
            const startDate = updateData.startDate || discount.startDate;
            const endDate = updateData.endDate || discount.endDate;

            if (endDate && new Date(endDate) <= new Date(startDate)) {
                throw new BadRequestError("End date must be after start date");
            }
        }

        // Validate percentage if being updated
        if (updateData.percentage !== undefined) {
            if (updateData.percentage < 0 || updateData.percentage > 100) {
                throw new BadRequestError("Percentage must be between 0 and 100");
            }
        }

        Object.assign(discount, updateData);
        await discount.save();

        return discount;
    }

    /**
     * Delete a discount
     * @param {String} discountId - Discount ID
     * @returns {Promise<Object>} Deleted discount
     */
    static async deleteDiscount(discountId) {
        const discount = await Discount.findByIdAndDelete(discountId);
        if (!discount) {
            throw new NotFoundError("Discount not found");
        }
        return discount;
    }

    /**
     * Get all discounts with filters
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Array>} List of discounts
     */
    static async getAllDiscounts(filters = {}) {
        const query = {};

        if (filters.discountType) {
            query.discountType = filters.discountType;
        }

        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
        }

        if (filters.startDate) {
            query.startDate = { $gte: new Date(filters.startDate) };
        }

        if (filters.endDate) {
            query.endDate = { $lte: new Date(filters.endDate) };
        }

        const discounts = await Discount.find(query)
            .populate("product", "title img price")
            .populate("brand", "name")
            .populate("category", "name")
            .populate("products", "title img price")
            .sort({ priority: 1, createdAt: -1 });

        return discounts;
    }

    /**
     * Get discount by ID
     * @param {String} discountId - Discount ID
     * @returns {Promise<Object>} Discount
     */
    static async getDiscountById(discountId) {
        const discount = await Discount.findById(discountId)
            .populate("product", "title img price")
            .populate("brand", "name")
            .populate("category", "name")
            .populate("products", "title img price");

        if (!discount) {
            throw new NotFoundError("Discount not found");
        }

        return discount;
    }

    /**
     * Get all active discounts
     * @returns {Promise<Array>} List of active discounts
     */
    static async getActiveDiscounts() {
        const now = new Date();

        const discounts = await Discount.find({
            isActive: true,
            startDate: { $lte: now },
            $or: [
                { endDate: { $gte: now } },
                { endDate: null }
            ]
        })
            .populate("product", "title img price")
            .populate("brand", "name")
            .populate("category", "name")
            .populate("products", "title img price")
            .sort({ priority: 1 });

        return discounts;
    }

    /**
     * Calculate discount for a specific product
     * Returns the highest priority applicable discount
     * @param {String} productId - Product ID
     * @returns {Promise<Object|null>} Discount object or null
     */
    static async calculateDiscountForProduct(productId) {
        const product = await Product.findById(productId).populate("brand category");
        if (!product) {
            throw new NotFoundError("Product not found");
        }

        // Get all applicable discounts
        const applicableDiscounts = await this.getApplicableDiscounts(product);

        if (applicableDiscounts.length === 0) {
            return null;
        }

        // Sort by priority (ascending) and return the first (highest priority)
        applicableDiscounts.sort((a, b) => a.priority - b.priority);

        return applicableDiscounts[0];
    }

    /**
     * Get all applicable discounts for a product
     * @param {Object} product - Product object with populated brand and category
     * @returns {Promise<Array>} List of applicable discounts
     */
    static async getApplicableDiscounts(product) {
        const now = new Date();

        // Build query for all possible applicable discounts
        const query = {
            isActive: true,
            startDate: { $lte: now },
            $or: [
                { endDate: { $gte: now } },
                { endDate: null }
            ],
            $or: [
                // Product-specific discount
                { discountType: DISCOUNT_TYPES.PRODUCT, product: product._id },
                // Brand discount
                { discountType: DISCOUNT_TYPES.BRAND, brand: product.brand?._id || product.brand },
                // Category discount
                { discountType: DISCOUNT_TYPES.CATEGORY, category: product.category?._id || product.category },
                // Product list discount
                { discountType: DISCOUNT_TYPES.PRODUCT_LIST, products: product._id },
                // Global discount
                { discountType: DISCOUNT_TYPES.GLOBAL }
            ]
        };

        const discounts = await Discount.find(query).sort({ priority: 1 });

        // Filter to only those that actually apply (using the model method)
        const applicableDiscounts = [];
        for (const discount of discounts) {
            if (discount.appliesToProduct(product)) {
                applicableDiscounts.push(discount);
            }
        }

        return applicableDiscounts;
    }

    /**
     * Toggle discount active status
     * @param {String} discountId - Discount ID
     * @returns {Promise<Object>} Updated discount
     */
    static async toggleDiscountStatus(discountId) {
        const discount = await Discount.findById(discountId);
        if (!discount) {
            throw new NotFoundError("Discount not found");
        }

        discount.isActive = !discount.isActive;
        await discount.save();

        return discount;
    }

    /**
     * Calculate sale price for a product based on discount
     * @param {Number} originalPrice - Original product price
     * @param {Object} discount - Discount object
     * @returns {Number} Sale price
     */
    static calculateSalePrice(originalPrice, discount) {
        if (!discount || !discount.percentage) {
            return originalPrice;
        }

        const discountAmount = (originalPrice * discount.percentage) / 100;
        return Math.round(originalPrice - discountAmount);
    }
}

module.exports = DiscountService;
