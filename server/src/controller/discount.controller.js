"use strict";

const DiscountService = require("../services/discount.service");
const { SuccessResponse, CREATED } = require("../core/success.response");
const { asynchandler } = require("../helpers/asynchandler");

class DiscountController {
    /**
     * Create a new discount
     * POST /v1/api/discounts
     */
    createDiscount = asynchandler(async (req, res) => {
        const discount = await DiscountService.createDiscount(req.body);
        new CREATED({
            message: "Discount created successfully",
            data: { discount }
        }).send(res);
    });

    /**
     * Update a discount
     * PUT /v1/api/discounts/:id
     */
    updateDiscount = asynchandler(async (req, res) => {
        const discount = await DiscountService.updateDiscount(req.params.id, req.body);
        new SuccessResponse({
            message: "Discount updated successfully",
            data: { discount }
        }).send(res);
    });

    /**
     * Delete a discount
     * DELETE /v1/api/discounts/:id
     */
    deleteDiscount = asynchandler(async (req, res) => {
        const discount = await DiscountService.deleteDiscount(req.params.id);
        new SuccessResponse({
            message: "Discount deleted successfully",
            data: { discount }
        }).send(res);
    });

    /**
     * Get all discounts with filters
     * GET /v1/api/discounts
     */
    getAllDiscounts = asynchandler(async (req, res) => {
        const filters = {
            discountType: req.query.discountType,
            isActive: req.query.isActive,
            startDate: req.query.startDate,
            endDate: req.query.endDate
        };

        const discounts = await DiscountService.getAllDiscounts(filters);
        new SuccessResponse({
            message: "Discounts retrieved successfully",
            data: {
                discounts,
                count: discounts.length
            }
        }).send(res);
    });

    /**
     * Get discount by ID
     * GET /v1/api/discounts/:id
     */
    getDiscountById = asynchandler(async (req, res) => {
        const discount = await DiscountService.getDiscountById(req.params.id);
        new SuccessResponse({
            message: "Discount retrieved successfully",
            data: { discount }
        }).send(res);
    });

    /**
     * Get all active discounts
     * GET /v1/api/discounts/active
     */
    getActiveDiscounts = asynchandler(async (req, res) => {
        const discounts = await DiscountService.getActiveDiscounts();
        new SuccessResponse({
            message: "Active discounts retrieved successfully",
            data: {
                discounts,
                count: discounts.length
            }
        }).send(res);
    });

    /**
     * Calculate discount for a product
     * POST /v1/api/discounts/calculate
     * Body: { productId: "..." }
     */
    calculateDiscount = asynchandler(async (req, res) => {
        const { productId } = req.body;
        const discount = await DiscountService.calculateDiscountForProduct(productId);

        new SuccessResponse({
            message: discount ? "Discount calculated successfully" : "No discount available for this product",
            data: { discount }
        }).send(res);
    });

    /**
     * Toggle discount active status
     * PATCH /v1/api/discounts/:id/toggle
     */
    toggleDiscountStatus = asynchandler(async (req, res) => {
        const discount = await DiscountService.toggleDiscountStatus(req.params.id);
        new SuccessResponse({
            message: "Discount status toggled successfully",
            data: { discount }
        }).send(res);
    });
}

module.exports = new DiscountController();
