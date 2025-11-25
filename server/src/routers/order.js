"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const orderController = require("../controller/order.Controller");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const router = express.Router();

/**
 * @swagger
 * /order:
 *   post:
 *     tags:
 *       - Order
 *     summary: Tạo đơn hàng mới
 *     description: Tạo đơn hàng mới cho người dùng đã đăng nhập
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
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, credit, draftVnpay, vnpay]
 *                 default: cash
 *     responses:
 *       201:
 *         description: Tạo đơn hàng thành công
 *       400:
 *         description: Thông tin không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 */
router.post(
  "/order",
  authentication,
  asynchandler(orderController.createNewOrder)
);

/**
 * @swagger
 * /order-status/{orderId}:
 *   put:
 *     tags:
 *       - Order
 *     summary: Cập nhật trạng thái đơn hàng (User)
 *     description: Người dùng cập nhật trạng thái đơn hàng của mình (chủ yếu để hủy đơn)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [cancel]
 *                 example: "cancel"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       403:
 *         description: Không thể hủy đơn hàng đã được xử lý
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.put(
  "/order-status/:orderId",
  authentication,
  asynchandler(orderController.updateStatus)
);

/**
 * @swagger
 * /order:
 *   get:
 *     tags:
 *       - Order
 *     summary: Lấy danh sách đơn hàng của user
 *     description: Lấy tất cả đơn hàng của người dùng đã đăng nhập
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *       401:
 *         description: Chưa đăng nhập
 */
router.get(
  "/order",
  authentication,
  asynchandler(orderController.getOrderByUser)
);

/**
 * @swagger
 * /order/all:
 *   get:
 *     tags:
 *       - Order
 *     summary: Lấy tất cả đơn hàng (Admin)
 *     description: Admin lấy danh sách tất cả đơn hàng có phân trang
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng items mỗi trang
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: "createdAt-desc"
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.get(
  "/order/all",
  adminAuthentication,
  asynchandler(orderController.getAllOrder)
);

/**
 * @swagger
 * /admin/order-status/{orderId}:
 *   put:
 *     tags:
 *       - Order
 *     summary: Cập nhật trạng thái đơn hàng (Admin)
 *     description: Admin cập nhật trạng thái đơn hàng
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, delivered, cancel]
 *                 example: "processing"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Chuyển trạng thái không hợp lệ
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.put(
  "/admin/order-status/:orderId",
  adminAuthentication,
  asynchandler(orderController.adminUpdateStatus)
);

module.exports = router;