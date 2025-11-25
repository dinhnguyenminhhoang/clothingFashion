"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const { adminAuthentication, authentication } = require("../auth/authUtils");
const reportController = require("../controller/report.controller");
const router = express.Router();

/**
 * @swagger
 * /report:
 *   post:
 *     tags:
 *       - Report
 *     summary: Tạo báo cáo/phản hồi mới
 *     description: Người dùng gửi báo cáo hoặc phản hồi đến hệ thống
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
 *               - name
 *               - email
 *               - phone
 *               - title
 *               - content
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               email:
 *                 type: string
 *                 example: "nguyenvana@gmail.com"
 *               phone:
 *                 type: string
 *                 example: "0123456789"
 *               title:
 *                 type: string
 *                 example: "Góp ý về sản phẩm"
 *               content:
 *                 type: string
 *                 example: "Tôi muốn góp ý về chất lượng sản phẩm..."
 *     responses:
 *       201:
 *         description: Tạo báo cáo thành công
 *       400:
 *         description: Thông tin không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 */
router.post(
  "/report",
  authentication,
  asynchandler(reportController.createNewReport)
);

/**
 * @swagger
 * /report:
 *   get:
 *     tags:
 *       - Report
 *     summary: Lấy danh sách báo cáo (Admin)
 *     description: Admin lấy danh sách tất cả báo cáo có phân trang
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
 *         description: Sắp xếp theo field
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.get(
  "/report",
  adminAuthentication,
  asynchandler(reportController.getAllReport)
);

/**
 * @swagger
 * /report/{reportId}:
 *   put:
 *     tags:
 *       - Report
 *     summary: Trả lời báo cáo (Admin)
 *     description: Admin trả lời báo cáo của khách hàng
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của báo cáo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Phản hồi: Góp ý về sản phẩm"
 *               content:
 *                 type: string
 *                 example: "Cảm ơn bạn đã góp ý. Chúng tôi sẽ cải thiện..."
 *     responses:
 *       200:
 *         description: Trả lời thành công
 *       404:
 *         description: Không tìm thấy báo cáo
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.put(
  "/report/:reportId",
  adminAuthentication,
  asynchandler(reportController.replyReport)
);

module.exports = router;