"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const userController = require("../controller/user.controller");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const router = express.Router();

/**
 * @swagger
 * /profile:
 *   get:
 *     tags:
 *       - User
 *     summary: Lấy thông tin profile
 *     description: Lấy thông tin profile của người dùng đang đăng nhập
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
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
 *                     _id:
 *                       type: string
 *                     userName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *       401:
 *         description: Chưa đăng nhập
 */
router.get(
  "/profile",
  authentication,
  asynchandler(userController.getUserInfo)
);

/**
 * @swagger
 * /profile:
 *   post:
 *     tags:
 *       - User
 *     summary: Cập nhật profile
 *     description: Cập nhật thông tin profile của người dùng đang đăng nhập
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               phone:
 *                 type: string
 *                 example: "0987654321"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         description: Chưa đăng nhập
 */
router.post(
  "/profile",
  authentication,
  asynchandler(userController.updateProfile)
);

router.post(
  "/address",
  authentication,
  asynchandler(userController.addAddress)
);

router.get(
  "/address",
  authentication,
  asynchandler(userController.getAddresses)
);

router.put(
  "/address/:addressId",
  authentication,
  asynchandler(userController.updateAddress)
);

router.delete(
  "/address/:addressId",
  authentication,
  asynchandler(userController.deleteAddress)
);

/**
 * @swagger
 * /user:
 *   get:
 *     tags:
 *       - User
 *     summary: Lấy danh sách người dùng (Admin)
 *     description: Admin lấy danh sách tất cả người dùng có phân trang
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
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.get(
  "/user",
  adminAuthentication,
  asynchandler(userController.getAllUser)
);

/**
 * @swagger
 * /user/{userId}:
 *   delete:
 *     tags:
 *       - User
 *     summary: Xóa người dùng (Admin)
 *     description: Admin xóa mềm người dùng (chuyển status thành inActive)
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *         example: "673abc123def456789"
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy người dùng
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.delete(
  "/user/:userId",
  adminAuthentication,
  asynchandler(userController.deleteUser)
);

/**
 * @swagger
 * /user:
 *   post:
 *     tags:
 *       - User
 *     summary: Tạo người dùng mới (Admin)
 *     description: Admin tạo tài khoản người dùng mới
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
 *               - userName
 *               - email
 *               - phone
 *               - password
 *               - roles
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "Nguyễn Văn B"
 *               email:
 *                 type: string
 *                 example: "nguyenvanb@gmail.com"
 *               phone:
 *                 type: string
 *                 example: "0123456789"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [USER, ADMIN]
 *                 example: ["USER"]
 *     responses:
 *       201:
 *         description: Tạo người dùng thành công
 *       400:
 *         description: Email đã tồn tại
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.post(
  "/user",
  adminAuthentication,
  asynchandler(userController.createUser)
);

/**
 * @swagger
 * /user/{userId}:
 *   put:
 *     tags:
 *       - User
 *     summary: Cập nhật người dùng (Admin)
 *     description: Admin cập nhật thông tin người dùng
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *         example: "673abc123def456789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "Nguyễn Văn C"
 *               phone:
 *                 type: string
 *                 example: "0987654321"
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [USER, ADMIN]
 *                 example: ["USER", "ADMIN"]
 *               status:
 *                 type: string
 *                 enum: [active, inActive]
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy người dùng
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.put(
  "/user/:userId",
  adminAuthentication,
  asynchandler(userController.updateUser)
);

module.exports = router;