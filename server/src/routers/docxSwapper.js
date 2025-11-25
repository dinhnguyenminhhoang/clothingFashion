"use strict";

const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const {
  uploadDocx,
  docxSwapperMiddleware,
} = require("../config/docxSwapper.config");

const router = express.Router();

/**
 * @swagger
 * /docx-swap:
 *   post:
 *     tags:
 *       - DOCX Swapper
 *     summary: Swap document với data tùy chỉnh
 *     description: Upload file DOCX template và thay thế placeholder bằng data custom
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - template
 *               - data
 *             properties:
 *               template:
 *                 type: string
 *                 format: binary
 *                 description: File DOCX template
 *               data:
 *                 type: string
 *                 description: JSON string chứa data để thay thế
 *                 example: '{"name":"Nguyễn Văn A","email":"test@gmail.com","phone":"0123456789"}'
 *     responses:
 *       200:
 *         description: File DOCX đã được tạo thành công
 *         content:
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/docx-swap",
  authentication,
  uploadDocx.single("template"),
  asynchandler(docxSwapperMiddleware.swapCustom)
);

/**
 * @swagger
 * /docx-swap/order/{orderId}:
 *   post:
 *     tags:
 *       - DOCX Swapper
 *     summary: Tạo document cho đơn hàng
 *     description: Upload template và tạo document với thông tin đơn hàng
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đơn hàng
 *         example: "673abc123def456789"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - template
 *             properties:
 *               template:
 *                 type: string
 *                 format: binary
 *                 description: File DOCX template đơn hàng
 *     responses:
 *       200:
 *         description: Document đơn hàng đã được tạo
 *         content:
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.post(
  "/docx-swap/order/:orderId",
  authentication,
  uploadDocx.single("template"),
  asynchandler(docxSwapperMiddleware.swapOrder)
);

/**
 * @swagger
 * /docx-swap/invoice/{orderId}:
 *   post:
 *     tags:
 *       - DOCX Swapper
 *     summary: Tạo hóa đơn cho đơn hàng (Admin only)
 *     description: Upload template và tạo hóa đơn với thông tin đơn hàng (Chỉ dành cho Admin)
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đơn hàng
 *         example: "673abc123def456789"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - template
 *             properties:
 *               template:
 *                 type: string
 *                 format: binary
 *                 description: File DOCX template hóa đơn
 *     responses:
 *       200:
 *         description: Hóa đơn đã được tạo thành công
 *         content:
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Không có quyền Admin
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.post(
  "/docx-swap/invoice/:orderId",
  adminAuthentication,
  uploadDocx.single("template"),
  asynchandler(docxSwapperMiddleware.swapOrder)
);

module.exports = router;