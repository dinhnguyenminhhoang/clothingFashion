"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const productController = require("../controller/product.controller");
const { adminAuthentication } = require("../auth/authUtils");
const router = express.Router();
/**
 * @swagger
 * /product/homepage/all-data:
 *   get:
 *     tags:
 *       - Homepage
 *     description: API tổng hợp trả về tất cả data cần thiết cho homepage. Bao gồm sản phẩm mới, bán chạy, đánh giá cao, nổi bật, sản phẩm theo category, danh sách category và brand.
 *     responses:
 *       200:
 *         description: Lấy data thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OK"
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     newArrivals:
 *                       type: array
 *                       description: 8 sản phẩm mới nhất
 *                     bestSellers:
 *                       type: array
 *                       description: 8 sản phẩm bán chạy nhất
 *                     topRated:
 *                       type: array
 *                       description: 8 sản phẩm đánh giá cao nhất
 *                     featuredProducts:
 *                       type: array
 *                       description: 8 sản phẩm nổi bật
 *                     productsByCategory:
 *                       type: array
 *                       description: Sản phẩm theo top 3 categories
 *                     categories:
 *                       type: array
 *                       description: Danh sách categories
 *                     brands:
 *                       type: array
 *                       description: Danh sách brands
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalProducts:
 *                           type: number
 *                         totalCategories:
 *                           type: number
 *                         totalBrands:
 *                           type: number
 */
router.get(
  "/product/homepage/all-data",
  asynchandler(productController.getHomepageData)
);

/**
 * @swagger
 * /product/new-arrivals:
 *   get:
 *     tags:
 *       - Homepage
 *     summary: Lấy sản phẩm mới nhất
 *     description: Lấy danh sách sản phẩm mới nhất theo thời gian tạo
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Số lượng sản phẩm
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
router.get(
  "/product/new-arrivals",
  asynchandler(productController.getNewArrivals)
);

/**
 * @swagger
 * /product/best-sellers:
 *   get:
 *     tags:
 *       - Homepage
 *     summary: Lấy sản phẩm bán chạy nhất
 *     description: Lấy danh sách sản phẩm bán chạy nhất dựa trên sellCount
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Số lượng sản phẩm
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
router.get(
  "/product/best-sellers",
  asynchandler(productController.getBestSellers)
);

/**
 * @swagger
 * /product/featured:
 *   get:
 *     tags:
 *       - Homepage
 *     summary: Lấy sản phẩm nổi bật
 *     description: Lấy danh sách sản phẩm nổi bật (score = 70% rating + 30% sellCount)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Số lượng sản phẩm
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
router.get(
  "/product/featured",
  asynchandler(productController.getFeaturedProducts)
);

/**
 * @swagger
 * /product/related/{productId}:
 *   get:
 *     tags:
 *       - Product
 *     summary: Lấy sản phẩm tương tự
 *     description: Lấy danh sách sản phẩm tương tự dựa trên category và brand
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 4
 *         description: Số lượng sản phẩm tương tự
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.get(
  "/product/related/:productId",
  asynchandler(productController.getRelatedProducts)
);

// ==================== ADMIN ROUTES ====================

/**
 * @swagger
 * /product:
 *   post:
 *     tags:
 *       - Product
 *     summary: Tạo sản phẩm mới (Admin)
 *     description: Tạo sản phẩm mới - Chỉ dành cho Admin
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
 *               - title
 *               - img
 *               - price
 *               - description
 *               - brand
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Áo thun nam cao cấp"
 *               img:
 *                 type: string
 *                 example: "/uploads/image.jpg"
 *               price:
 *                 type: number
 *                 example: 299000
 *               description:
 *                 type: string
 *                 example: "Áo thun chất liệu cotton 100%"
 *               sizes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     size:
 *                       type: string
 *                       example: "M"
 *                     quantity:
 *                       type: number
 *                       example: 50
 *                     originPrice:
 *                       type: number
 *                       example: 250000
 *               brand:
 *                 type: string
 *                 example: "673abc123def456789"
 *               category:
 *                 type: string
 *                 example: "673abc123def456789"
 *     responses:
 *       201:
 *         description: Tạo sản phẩm thành công
 *       400:
 *         description: Thông tin không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền Admin
 */
router.post(
  "/product",
  adminAuthentication,
  asynchandler(productController.createNewProduct)
);

/**
 * @swagger
 * /product/{id}:
 *   put:
 *     tags:
 *       - Product
 *     summary: Cập nhật sản phẩm (Admin)
 *     description: Cập nhật thông tin sản phẩm - Chỉ dành cho Admin
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.put(
  "/product/:id",
  adminAuthentication,
  asynchandler(productController.updateProduct)
);

/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     tags:
 *       - Product
 *     summary: Xóa sản phẩm (Admin)
 *     description: Xóa mềm sản phẩm - Chỉ dành cho Admin
 *     security:
 *       - bearerAuth: []
 *       - clientId: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.delete(
  "/product/:id",
  adminAuthentication,
  asynchandler(productController.deleteProduct)
);

// ==================== PUBLIC ROUTES ====================

/**
 * @swagger
 * /product:
 *   get:
 *     tags:
 *       - Product
 *     summary: Danh sách sản phẩm (có filter, search, sort, pagination)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: "price-asc"
 *         description: "Sắp xếp: price-asc, price-desc, createdAt-desc, sellCount-desc"
 *       - in: query
 *         name: priceRange
 *         schema:
 *           type: string
 *           example: "100000,500000"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: "in-stock"
 *       - in: query
 *         name: searchText
 *         schema:
 *           type: string
 *           example: "áo thun"
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
router.get("/product", asynchandler(productController.getAllProducts));

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     tags:
 *       - Product
 *     summary: Chi tiết sản phẩm
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.get("/product/:id", asynchandler(productController.getProductdetail));

/**
 * @swagger
 * /product-type/{type}:
 *   get:
 *     tags:
 *       - Product
 *     summary: Sản phẩm theo loại
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         example: "áo"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
router.get(
  "/product-type/:type",
  asynchandler(productController.getProductType)
);

/**
 * @swagger
 * /product-popular-type:
 *   get:
 *     tags:
 *       - Product
 *     summary: Sản phẩm phổ biến theo loại
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
router.get(
  "/product-popular-type",
  asynchandler(productController.getPopularProductByType)
);

/**
 * @swagger
 * /product-top-rate:
 *   get:
 *     tags:
 *       - Product
 *     summary: Sản phẩm đánh giá cao nhất
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
router.get(
  "/product-top-rate",
  asynchandler(productController.getTopRatedProduct)
);

/**
 * @swagger
 * /product-quantity/{productId}:
 *   get:
 *     tags:
 *       - Product
 *     summary: Lấy lịch sử nhập hàng
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.get(
  "/product-quantity/:productId",
  asynchandler(productController.getProductQuantities)
);

/**
 * @swagger
 * /product-size/{productId}:
 *   get:
 *     tags:
 *       - Product
 *     summary: Lấy danh sách size của sản phẩm
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.get(
  "/product-size/:productId",
  asynchandler(productController.getProductSizes)
);

/**
 * @swagger
 * /product-quantity/{productId}:
 *   post:
 *     tags:
 *       - Product
 *     summary: Nhập hàng cho sản phẩm
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - size
 *               - quantity
 *             properties:
 *               size:
 *                 type: string
 *                 description: ID của size
 *                 example: "673abc123def456789"
 *               quantity:
 *                 type: number
 *                 example: 100
 *               note:
 *                 type: string
 *                 example: "Nhập hàng tháng 10/2024"
 *     responses:
 *       201:
 *         description: Nhập hàng thành công
 *       404:
 *         description: Không tìm thấy sản phẩm hoặc size
 */
router.post(
  "/product-quantity/:productId",
  asynchandler(productController.createProductQuantities)
);

module.exports = router;