"use strict";

const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const { adminAuthentication } = require("../auth/authUtils");
const uploadController = require("../controller/upload.controller");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const router = express.Router();

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.use("/uploads", express.static(uploadsDir));

/**
 * @swagger
 * /upload:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload hình ảnh sản phẩm (Admin)
 *     description: Upload tối đa 10 file ảnh - Chỉ dành cho Admin
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: File ảnh (tối đa 10 files)
 *     responses:
 *       200:
 *         description: Upload thành công
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                       path:
 *                         type: string
 *       400:
 *         description: Không có file được upload
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.post(
  "/upload",
  adminAuthentication,
  upload.array("file", 10),
  asynchandler(uploadController.uploadProduct)
);

module.exports = router;