"use strict";

const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "Voucher";
const COLLECTION_NAME = "Vouchers";

const voucherSchema = new Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        maxDiscount: {
            type: Number,
            default: null,
        },
        minOrderValue: {
            type: Number,
            default: 0,
        },
        startDate: {
            type: Date,
            required: true,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        usageLimit: {
            type: Number,
            default: null, // null = unlimited
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        applicableProducts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
        applicableCategories: [
            {
                type: Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
        usedBy: [
            {
                user: { type: Schema.Types.ObjectId, ref: "User" },
                usedAt: { type: Date, default: Date.now },
                orderValue: Number,
            },
        ],
    },
    { timestamps: true, collection: COLLECTION_NAME }
);

// Validation middleware
voucherSchema.pre("save", function (next) {
    // Validate discount value for percentage type
    if (this.discountType === "percentage" && this.discountValue > 100) {
        next(new Error("Percentage discount cannot exceed 100%"));
    }

    // Validate dates
    if (this.expiryDate <= this.startDate) {
        next(new Error("Expiry date must be after start date"));
    }

    next();
});

module.exports = {
    Voucher: model(DOCUMENT_NAME, voucherSchema),
};
