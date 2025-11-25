"use strict";

const { SuccessResponse, CREATED } = require("../core/success.response");
const VoucherService = require("../services/voucher.service");

class VoucherController {
    createVoucher = async (req, res, next) => {
        new CREATED({
            message: "Voucher created successfully",
            data: await VoucherService.createVoucher(req.body),
        }).send(res);
    };

    getAllVouchers = async (req, res, next) => {
        new SuccessResponse({
            data: await VoucherService.getAllVouchers(req.query),
        }).send(res);
    };

    getVoucherById = async (req, res, next) => {
        new SuccessResponse({
            data: await VoucherService.getVoucherById(req.params.id),
        }).send(res);
    };

    updateVoucher = async (req, res, next) => {
        new SuccessResponse({
            message: "Voucher updated successfully",
            data: await VoucherService.updateVoucher(req.params.id, req.body),
        }).send(res);
    };

    deleteVoucher = async (req, res, next) => {
        new SuccessResponse({
            data: await VoucherService.deleteVoucher(req.params.id),
        }).send(res);
    };

    validateVoucher = async (req, res, next) => {
        new SuccessResponse({
            data: await VoucherService.validateVoucher(
                req.body.code,
                req.body.orderData
            ),
        }).send(res);
    };

    getActiveVouchers = async (req, res, next) => {
        new SuccessResponse({
            data: await VoucherService.getActiveVouchers(),
        }).send(res);
    };
}

module.exports = new VoucherController();
