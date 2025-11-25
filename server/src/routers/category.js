"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const { adminAuthentication } = require("../auth/authUtils");
const categoryController = require("../controller/category.controller");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Setup uploads directory
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * /category:
 *   post:
 *     tags:
 *       - Category
 *     summary: Tạo danh mục mới (Admin)
 *     description: Tạo category mới - Chỉ dành cho Admin
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Áo thun"
 *               description:
 *                 type: string
 *                 example: "Các loại áo thun nam nữ"
 *     responses:
 *       201:
 *         description: Tạo category thành công
 *       400:
 *         description: Thông tin không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.post(
  "/category",
  adminAuthentication,
  upload.single("image"),
  asynchandler(categoryController.createNewCategory)
);

/**
 * @swagger
 * /category/{id}:
 *   put:
 *     tags:
 *       - Category
 *     summary: Cập nhật danh mục (Admin)
 *     description: Cập nhật thông tin category - Chỉ dành cho Admin
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của category
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
 *                 example: "Áo thun cao cấp"
 *               description:
 *                 type: string
 *                 example: "Áo thun chất lượng cao"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy category
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.put(
  "/category/:id",
  adminAuthentication,
  upload.single("image"),
  asynchandler(categoryController.updateCategory)
);

/**
 * @swagger
 * /category:
 *   get:
 *     tags:
 *       - Category
 *     summary: Lấy danh sách danh mục
 *     description: Lấy danh sách tất cả category (có phân trang)
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
router.get("/category", asynchandler(categoryController.getAllCategories));

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     tags:
 *       - Category
 *     summary: Xóa danh mục (Admin)
 *     description: Xóa mềm category (chuyển status thành inActive) - Chỉ dành cho Admin
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của category
 *         example: "673abc123def456789"
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy category
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.delete(
  "/category/:id",
  adminAuthentication,
  asynchandler(categoryController.deleteCategory)
);

module.exports = router;