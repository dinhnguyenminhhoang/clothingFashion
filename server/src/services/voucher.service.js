"use strict";

const { default: mongoose } = require("mongoose");
const {
    NotFoundError,
    badRequestError,
    ForbiddenError,
} = require("../core/error.response");
const { Voucher } = require("../models/voucher.model");
const { paginate } = require("../utils/paginate");

class VoucherService {
    // Admin methods
    static createVoucher = async (data) => {
        const existingVoucher = await Voucher.findOne({ code: data.code.toUpperCase() });
        if (existingVoucher) {
            throw new badRequestError("Voucher code already exists");
        }

        const voucher = await Voucher.create({
            ...data,
            code: data.code.toUpperCase(),
        });

        return voucher;
    };

    static updateVoucher = async (voucherId, data) => {
        const voucher = await Voucher.findById(voucherId);
        if (!voucher) {
            throw new NotFoundError("Voucher not found");
        }

        // If updating code, check uniqueness
        if (data.code && data.code.toUpperCase() !== voucher.code) {
            const existing = await Voucher.findOne({ code: data.code.toUpperCase() });
            if (existing) {
                throw new badRequestError("Voucher code already exists");
            }
            data.code = data.code.toUpperCase();
        }

        const updatedVoucher = await Voucher.findByIdAndUpdate(
            voucherId,
            data,
            { new: true }
        );

        return updatedVoucher;
    };

    static deleteVoucher = async (voucherId) => {
        const voucher = await Voucher.findById(voucherId);
        if (!voucher) {
            throw new NotFoundError("Voucher not found");
        }

        await Voucher.findByIdAndDelete(voucherId);
        return { message: "Voucher deleted successfully" };
    };

    static getAllVouchers = async (query) => {
        const { page = 1, limit = 10, filters = {}, searchText } = query;

        const result = await paginate({
            model: Voucher,
            page: +page,
            limit: +limit,
            filters,
            searchText,
            searchFields: ["code", "description"],
            options: { sort: { createdAt: -1 } },
        });

        return result;
    };

    static getVoucherById = async (voucherId) => {
        const voucher = await Voucher.findById(voucherId);
        if (!voucher) {
            throw new NotFoundError("Voucher not found");
        }
        return voucher;
    };

    // User methods
    static validateVoucher = async (code, orderData) => {
        const voucher = await Voucher.findOne({
            code: code.toUpperCase(),
            isActive: true,
        });

        if (!voucher) {
            throw new NotFoundError("Mã giảm giá không tồn tại");
        }

        const now = new Date();

        // Check if voucher is active within date range
        if (now < voucher.startDate) {
            throw new badRequestError("Mã giảm giá chưa có hiệu lực");
        }

        if (now > voucher.expiryDate) {
            throw new badRequestError("Mã giảm giá đã hết hạn");
        }

        // Check usage limit
        if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
            throw new badRequestError("Mã giảm giá đã hết lượt sử dụng");
        }

        // Check minimum order value
        if (orderData.totalAmount < voucher.minOrderValue) {
            throw new badRequestError(
                `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()}đ để sử dụng mã này`
            );
        }

        // Check product eligibility
        if (voucher.applicableProducts.length > 0) {
            const productIds = orderData.products.map((p) => p._id.toString());
            const eligible = voucher.applicableProducts.some((id) =>
                productIds.includes(id.toString())
            );
            if (!eligible) {
                throw new badRequestError("Mã giảm giá không áp dụng cho sản phẩm này");
            }
        }

        // Check category eligibility
        if (voucher.applicableCategories.length > 0) {
            const categoryIds = orderData.products
                .map((p) => p.category?.toString())
                .filter(Boolean);
            const eligible = voucher.applicableCategories.some((id) =>
                categoryIds.includes(id.toString())
            );
            if (!eligible) {
                throw new badRequestError(
                    "Mã giảm giá không áp dụng cho danh mục sản phẩm này"
                );
            }
        }

        // Calculate discount
        let discount = 0;
        if (voucher.discountType === "percentage") {
            discount = (orderData.totalAmount * voucher.discountValue) / 100;
            if (voucher.maxDiscount) {
                discount = Math.min(discount, voucher.maxDiscount);
            }
        } else {
            discount = voucher.discountValue;
        }

        // Ensure discount doesn't exceed order total
        discount = Math.min(discount, orderData.totalAmount);

        return {
            valid: true,
            voucher: {
                _id: voucher._id,
                code: voucher.code,
                description: voucher.description,
                discountType: voucher.discountType,
                discountValue: voucher.discountValue,
            },
            discount: Math.round(discount),
            finalAmount: orderData.totalAmount - Math.round(discount),
        };
    };

    static applyVoucher = async (code, userId, orderId, orderValue) => {
        const voucher = await Voucher.findOne({ code: code.toUpperCase() });
        if (!voucher) {
            throw new NotFoundError("Voucher not found");
        }

        // Increment usage count
        voucher.usedCount += 1;

        // Add to usedBy array
        voucher.usedBy.push({
            user: userId,
            usedAt: new Date(),
            orderValue: orderValue,
        });

        await voucher.save();
        return voucher;
    };

    static getActiveVouchers = async () => {
        const now = new Date();
        const vouchers = await Voucher.find({
            isActive: true,
            startDate: { $lte: now },
            expiryDate: { $gte: now },
            $or: [
                { usageLimit: null },
                { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
            ],
        })
            .select("-usedBy")
            .limit(10)
            .lean();

        return vouchers;
    };

    static calculateDiscount = (voucher, orderTotal) => {
        let discount = 0;
        if (voucher.discountType === "percentage") {
            discount = (orderTotal * voucher.discountValue) / 100;
            if (voucher.maxDiscount) {
                discount = Math.min(discount, voucher.maxDiscount);
            }
        } else {
            discount = voucher.discountValue;
        }
        return Math.min(discount, orderTotal);
    };
}

module.exports = VoucherService;
