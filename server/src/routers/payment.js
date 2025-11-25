"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const { authentication } = require("../auth/authUtils");
const router = express.Router();
const paymentController = require("../controller/payment.controller");

/**
 * @swagger
 * /payment:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Tạo link thanh toán VNPay
 *     description: Tạo đơn hàng và trả về link thanh toán VNPay
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cart
 *               - address
 *               - phone
 *               - totalAmount
 *             properties:
 *               recipientName:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               cart:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       example: "673abc123def456789"
 *                     quantity:
 *                       type: number
 *                       example: 2
 *                     size:
 *                       type: string
 *                       example: "M"
 *               address:
 *                 type: string
 *                 example: "123 Đường ABC, Quận 1, TP.HCM"
 *               phone:
 *                 type: string
 *                 example: "0123456789"
 *               totalAmount:
 *                 type: number
 *                 example: 500000
 *               language:
 *                 type: string
 *                 enum: [vn, en]
 *                 default: vn
 *                 example: "vn"
 *               orderType:
 *                 type: string
 *                 default: other
 *                 example: "other"
 *     responses:
 *       200:
 *         description: Trả về link thanh toán VNPay thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: number
 *                 data:
 *                   type: string
 *                   description: URL thanh toán VNPay
 *                   example: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
 *       400:
 *         description: Thông tin không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 */
router.post(
  "/payment",
  authentication,
  asynchandler(paymentController.payment)
);

module.exports = router;