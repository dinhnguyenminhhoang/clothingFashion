"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const reviewController = require("../controller/review.controller");
const { authentication } = require("../auth/authUtils");
const router = express.Router();

/**
 * @swagger
 * /review:
 *   post:
 *     tags:
 *       - Review
 *     summary: Tạo đánh giá sản phẩm
 *     description: Người dùng đánh giá sản phẩm đã mua (chỉ được đánh giá sau khi nhận hàng)
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
 *               - product
 *               - rating
 *               - orderId
 *             properties:
 *               product:
 *                 type: string
 *                 description: ID của sản phẩm
 *                 example: "673abc123def456789"
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Sản phẩm rất tốt, đáng giá tiền"
 *               orderId:
 *                 type: string
 *                 description: ID của đơn hàng
 *                 example: "673abc123def456789"
 *     responses:
 *       201:
 *         description: Tạo đánh giá thành công
 *       400:
 *         description: Thông tin không hợp lệ hoặc đã đánh giá rồi
 *       403:
 *         description: Chưa mua sản phẩm này
 *       401:
 *         description: Chưa đăng nhập
 */
router.post(
  "/review",
  authentication,
  asynchandler(reviewController.createNewReview)
);

/**
 * @swagger
 * /review/{id}:
 *   delete:
 *     tags:
 *       - Review
 *     summary: Xóa đánh giá
 *     description: Xóa tất cả đánh giá của một sản phẩm
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy đánh giá
 */
router.delete("/review/:id", asynchandler(reviewController.deleteReview));

/**
 * @swagger
 * /review/high-rated:
 *   get:
 *     tags:
 *       - Review
 *     summary: Lấy đánh giá cao (4-5 sao)
 *     description: Lấy danh sách các đánh giá có rating >= 4 sao
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng đánh giá cần lấy
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
router.get(
  "/review/high-rated",
  asynchandler(reviewController.getHighRatedReviews)
);

module.exports = router;