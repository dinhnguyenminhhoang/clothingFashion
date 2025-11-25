"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const accessController = require("../controller/access.controller");
const { authentication } = require("../auth/authUtils");
const router = express.Router();

/**
 * @swagger
 * /register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Đăng ký tài khoản mới
 *     description: Tạo tài khoản user mới và gửi mã xác thực 6 số qua email
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
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               email:
 *                 type: string
 *                 example: "nguyenvana@gmail.com"
 *               phone:
 *                 type: string
 *                 example: "0123456789"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Đăng ký thành công, mã xác thực đã được gửi qua email
 *       400:
 *         description: Email đã tồn tại hoặc thông tin không hợp lệ
 */
router.post("/register", asynchandler(accessController.singUp));

/**
 * @swagger
 * /verify-account:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Xác thực tài khoản bằng mã 6 số
 *     description: Kích hoạt tài khoản sau khi nhập mã xác thực 6 số
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 example: "nguyenvana@gmail.com"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Xác thực thành công
 *       400:
 *         description: Mã xác thực không đúng hoặc đã hết hạn
 */
router.post("/verify-account", asynchandler(accessController.verifyAccount));

/**
 * @swagger
 * /resend-verification-code:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Gửi lại mã xác thực
 *     description: Gửi lại mã xác thực 6 số mới qua email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "nguyenvana@gmail.com"
 *     responses:
 *       200:
 *         description: Mã xác thực mới đã được gửi
 *       404:
 *         description: Email không tồn tại
 */
router.post(
  "/resend-verification-code",
  asynchandler(accessController.resendVerificationCode)
);

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Đăng nhập
 *     description: Đăng nhập và nhận access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "nguyenvana@gmail.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       400:
 *         description: Sai email hoặc mật khẩu
 *       401:
 *         description: Tài khoản chưa được kích hoạt
 */
router.post("/login", asynchandler(accessController.login));

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Quên mật khẩu
 *     description: Gửi mã xác thực 6 số qua email để reset mật khẩu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "nguyenvana@gmail.com"
 *     responses:
 *       200:
 *         description: Mã xác thực đã được gửi qua email
 *       404:
 *         description: Email không tồn tại
 */
router.post("/forgot-password", asynchandler(accessController.forgotPassword));

/**
 * @swagger
 * /verify-reset-code:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Kiểm tra mã reset password
 *     description: Xác minh mã 6 số có hợp lệ để reset password hay không
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 example: "nguyenvana@gmail.com"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Mã xác thực hợp lệ
 *       400:
 *         description: Mã xác thực không đúng hoặc đã hết hạn
 */
router.post(
  "/verify-reset-code",
  asynchandler(accessController.verifyResetCode)
);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Đặt lại mật khẩu
 *     description: Đặt lại mật khẩu với mã xác thực 6 số
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "nguyenvana@gmail.com"
 *               code:
 *                 type: string
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Mã xác thực không đúng hoặc đã hết hạn
 */
router.post("/reset-password", asynchandler(accessController.resetPassword));

/**
 * @swagger
 * /confirm-account:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Xác nhận tài khoản (deprecated - dùng link cũ)
 *     description: Kích hoạt tài khoản sau khi đăng ký (phương thức cũ với JWT token)
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     responses:
 *       200:
 *         description: Xác nhận thành công
 *       401:
 *         description: Token không hợp lệ
 */
router.post(
  "/confirm-account",
  authentication,
  asynchandler(accessController.confirmAccount)
);

module.exports = router;