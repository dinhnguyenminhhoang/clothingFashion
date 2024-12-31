"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const productController = require("../controller/product.controller");
const router = express.Router();

router.post("/product", asynchandler(productController.createNewProduct));

router.put("/product/:id", asynchandler(productController.updateProduct));

router.get("/product", asynchandler(productController.getAllProducts));
router.get("/product/:id", asynchandler(productController.getProductdetail));

router.get(
  "/product-type/:type",
  asynchandler(productController.getProductType)
);

router.get(
  "/product-popular-type",
  asynchandler(productController.getPopularProductByType)
);
router.get(
  "/product-top-rate",
  asynchandler(productController.getTopRatedProduct)
);

module.exports = router;
