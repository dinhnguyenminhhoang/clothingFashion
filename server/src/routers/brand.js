"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const brandController = require("../controller/brand.controller");
const { adminAuthentication } = require("../auth/authUtils");
const router = express.Router();

/**
 * @swagger
 * /brand:
 *   post:
 *     tags:
 *       - Brand
 *     summary: Tạo thương hiệu mới (Admin)
 *     description: Tạo brand mới - Chỉ dành cho Admin
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
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nike"
 *               address:
 *                 type: string
 *                 example: "123 Đường ABC, TP.HCM"
 *               description:
 *                 type: string
 *                 example: "Thương hiệu thể thao nổi tiếng"
 *     responses:
 *       201:
 *         description: Tạo brand thành công
 *       400:
 *         description: Thông tin không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.post(
  "/brand",
  adminAuthentication,
  asynchandler(brandController.createNewBrand)
);

/**
 * @swagger
 * /brand/{id}:
 *   put:
 *     tags:
 *       - Brand
 *     summary: Cập nhật thương hiệu (Admin)
 *     description: Cập nhật thông tin brand - Chỉ dành cho Admin
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của brand
 *         example: "673abc123def456789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nike Vietnam"
 *               address:
 *                 type: string
 *                 example: "456 Đường XYZ, Hà Nội"
 *               description:
 *                 type: string
 *                 example: "Thương hiệu thể thao số 1"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy brand
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.put(
  "/brand/:id",
  adminAuthentication,
  asynchandler(brandController.updateBrand)
);

/**
 * @swagger
 * /brand:
 *   get:
 *     tags:
 *       - Brand
 *     summary: Lấy danh sách thương hiệu
 *     description: Lấy danh sách tất cả brand (có phân trang)
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
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
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
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                     meta:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         page:
 *                           type: number
 *                         totalPages:
 *                           type: number
 */
router.get("/brand", asynchandler(brandController.getALlbrand));

/**
 * @swagger
 * /brand/{id}:
 *   delete:
 *     tags:
 *       - Brand
 *     summary: Xóa thương hiệu (Admin)
 *     description: Xóa mềm brand (chuyển status thành inActive) - Chỉ dành cho Admin
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của brand
 *         example: "673abc123def456789"
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy brand
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.delete(
  "/brand/:id",
  adminAuthentication,
  asynchandler(brandController.deleteBrand)
);

module.exports = router;