"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "Discounts";

// Discount type enum
const DISCOUNT_TYPES = {
    PRODUCT: "PRODUCT",           // Specific product
    BRAND: "BRAND",               // All products of a brand
    CATEGORY: "CATEGORY",         // All products in a category
    PRODUCT_LIST: "PRODUCT_LIST", // Multiple selected products
    GLOBAL: "GLOBAL"              // All products
};

const discountSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        terms: {
            type: String,
            trim: true
        },

        // Discount type
        discountType: {
            type: String,
            required: true,
            enum: Object.values(DISCOUNT_TYPES),
            default: DISCOUNT_TYPES.GLOBAL
        },

        // References based on discount type
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            index: true
        },
        brand: {
            type: Schema.Types.ObjectId,
            ref: "Brand",
            index: true
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            index: true
        },

        // For PRODUCT_LIST type - multiple products
        products: [{
            type: Schema.Types.ObjectId,
            ref: "Product"
        }],

        // Discount percentage (0-100)
        percentage: {
            type: Number,
            required: true,
            min: [0, "Discount cannot be negative"],
            max: [100, "Discount cannot exceed 100%"],
        },

        // Priority for conflict resolution (lower number = higher priority)
        // Default priorities: PRODUCT=1, PRODUCT_LIST=2, BRAND=3, CATEGORY=4, GLOBAL=5
        priority: {
            type: Number,
            default: 5,
            min: 1
        },

        // Validity period
        startDate: {
            type: Date,
            default: Date.now,
            index: true
        },
        endDate: {
            type: Date,
            index: true
        },

        // Manual toggle
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME
    }
);

// Compound indexes for efficient queries
discountSchema.index({ discountType: 1, isActive: 1 });
discountSchema.index({ startDate: 1, endDate: 1, isActive: 1 });

// Validation middleware
discountSchema.pre("save", function (next) {
    // Set default priority based on discount type if not specified
    if (this.isNew && !this.priority) {
        switch (this.discountType) {
            case DISCOUNT_TYPES.PRODUCT:
                this.priority = 1;
                break;
            case DISCOUNT_TYPES.PRODUCT_LIST:
                this.priority = 2;
                break;
            case DISCOUNT_TYPES.BRAND:
                this.priority = 3;
                break;
            case DISCOUNT_TYPES.CATEGORY:
                this.priority = 4;
                break;
            case DISCOUNT_TYPES.GLOBAL:
                this.priority = 5;
                break;
            default:
                this.priority = 5;
        }
    }

    // Validate that correct reference is set based on discount type
    switch (this.discountType) {
        case DISCOUNT_TYPES.PRODUCT:
            if (!this.product) {
                return next(new Error("Product reference is required for PRODUCT discount type"));
            }
            // Clear other references
            this.brand = undefined;
            this.category = undefined;
            this.products = [];
            break;

        case DISCOUNT_TYPES.BRAND:
            if (!this.brand) {
                return next(new Error("Brand reference is required for BRAND discount type"));
            }
            this.product = undefined;
            this.category = undefined;
            this.products = [];
            break;

        case DISCOUNT_TYPES.CATEGORY:
            if (!this.category) {
                return next(new Error("Category reference is required for CATEGORY discount type"));
            }
            this.product = undefined;
            this.brand = undefined;
            this.products = [];
            break;

        case DISCOUNT_TYPES.PRODUCT_LIST:
            if (!this.products || this.products.length === 0) {
                return next(new Error("Products array is required for PRODUCT_LIST discount type"));
            }
            this.product = undefined;
            this.brand = undefined;
            this.category = undefined;
            break;

        case DISCOUNT_TYPES.GLOBAL:
            // Clear all references for global discount
            this.product = undefined;
            this.brand = undefined;
            this.category = undefined;
            this.products = [];
            break;
    }

    // Validate dates
    if (this.endDate && this.startDate && this.endDate <= this.startDate) {
        return next(new Error("End date must be after start date"));
    }

    next();
});

// Helper to check if discount is currently valid
discountSchema.methods.isValid = function () {
    const now = new Date();
    if (!this.isActive) return false;
    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;
    return true;
};

// Helper to check if discount applies to a product
discountSchema.methods.appliesToProduct = function (product) {
    if (!this.isValid()) return false;

    switch (this.discountType) {
        case DISCOUNT_TYPES.PRODUCT:
            return this.product && this.product.toString() === product._id.toString();

        case DISCOUNT_TYPES.BRAND:
            const brandId = product.brand?._id || product.brand;
            return this.brand && brandId && this.brand.toString() === brandId.toString();

        case DISCOUNT_TYPES.CATEGORY:
            const categoryId = product.category?._id || product.category;
            return this.category && categoryId && this.category.toString() === categoryId.toString();

        case DISCOUNT_TYPES.PRODUCT_LIST:
            return this.products.some(pid => pid.toString() === product._id.toString());

        case DISCOUNT_TYPES.GLOBAL:
            return true;

        default:
            return false;
    }
};

module.exports = {
    Discount: model(DOCUMENT_NAME, discountSchema),
    DISCOUNT_TYPES
};
