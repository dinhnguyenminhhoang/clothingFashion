"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const { adminAuthentication } = require("../auth/authUtils");
const summaryController = require("../controller/summary.controller");

const router = express.Router();

/**
 * @swagger
 * /summary/total:
 *   get:
 *     tags:
 *       - Summary
 *     summary: Lấy tổng quan hệ thống (Admin)
 *     description: Lấy thống kê tổng số người dùng, đơn hàng, sản phẩm, nhãn hàng
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     responses:
 *       200:
 *         description: Lấy thống kê thành công
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
 *                       title:
 *                         type: string
 *                         example: "Tổng số người dùng"
 *                       count:
 *                         type: number
 *                         example: 150
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.get(
  "/summary/total",
  adminAuthentication,
  asynchandler(summaryController.getTotalSumary)
);

/**
 * @swagger
 * /summary/user/{type}:
 *   get:
 *     tags:
 *       - Summary
 *     summary: Thống kê người dùng theo thời gian (Admin)
 *     description: Lấy thống kê số lượng người dùng mới theo ngày hoặc tháng
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, month]
 *         description: Loại thống kê (theo ngày hoặc tháng)
 *         example: "day"
 *     responses:
 *       200:
 *         description: Lấy thống kê thành công
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
 *                       time:
 *                         type: string
 *                         example: "2024-10-18"
 *                       count:
 *                         type: number
 *                         example: 5
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Type không hợp lệ
 */
router.get(
  "/summary/user/:type",
  adminAuthentication,
  asynchandler(summaryController.getUserSummary)
);

/**
 * @swagger
 * /summary/brand/{type}:
 *   get:
 *     tags:
 *       - Summary
 *     summary: Thống kê nhãn hàng theo thời gian (Admin)
 *     description: Lấy thống kê số lượng nhãn hàng mới theo ngày hoặc tháng
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, month]
 *         description: Loại thống kê (theo ngày hoặc tháng)
 *         example: "month"
 *     responses:
 *       200:
 *         description: Lấy thống kê thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Type không hợp lệ
 */
router.get(
  "/summary/brand/:type",
  adminAuthentication,
  asynchandler(summaryController.getBrandSummary)
);

/**
 * @swagger
 * /summary/product/{type}:
 *   get:
 *     tags:
 *       - Summary
 *     summary: Thống kê sản phẩm theo thời gian (Admin)
 *     description: Lấy thống kê số lượng sản phẩm mới theo ngày hoặc tháng
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, month]
 *         description: Loại thống kê (theo ngày hoặc tháng)
 *         example: "day"
 *     responses:
 *       200:
 *         description: Lấy thống kê thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Type không hợp lệ
 */
router.get(
  "/summary/product/:type",
  adminAuthentication,
  asynchandler(summaryController.getProductSummary)
);

/**
 * @swagger
 * /summary/order/{type}:
 *   get:
 *     tags:
 *       - Summary
 *     summary: Thống kê đơn hàng theo thời gian (Admin)
 *     description: Lấy thống kê số lượng đơn hàng mới theo ngày hoặc tháng
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, month]
 *         description: Loại thống kê (theo ngày hoặc tháng)
 *         example: "month"
 *     responses:
 *       200:
 *         description: Lấy thống kê thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Type không hợp lệ
 */
router.get(
  "/summary/order/:type",
  adminAuthentication,
  asynchandler(summaryController.getOrderSummary)
);

router.get(
  "/summary/revenue/:type",
  adminAuthentication,
  asynchandler(summaryController.getRevenueSummary)
);

router.get(
  "/summary/order-status",
  adminAuthentication,
  asynchandler(summaryController.getOrderStatusSummary)
);

router.get(
  "/summary/top-products",
  adminAuthentication,
  asynchandler(summaryController.getTopSellingProducts)
);

router.get(
  "/summary/recent-orders",
  adminAuthentication,
  asynchandler(summaryController.getRecentOrders)
);

module.exports = router;