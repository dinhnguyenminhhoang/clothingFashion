"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");

class ProductController {
  createNewProduct = async (req, res, next) => {
    new CREATED({
      data: await ProductService.createNewProduct(req.body),
    }).send(res);
  };

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.updateProduct(req.params.id, req.body),
    }).send(res);
  };

  deleteProduct = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.deleteProduct(req.params.id),
    }).send(res);
  };

  getAllProducts = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.getAllProducts(req.query),
    }).send(res);
  };

  getProductdetail = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.getProductDetail(req.params.id),
    }).send(res);
  };

  getPopularProductByType = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.getPopularProductByType(
        req.params.type,
        req.query
      ),
    }).send(res);
  };

  getProductType = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.getProductType(req.params.type, req.query),
    }).send(res);
  };

  getTopRatedProduct = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.getTopRatedProduct(),
    }).send(res);
  };

  getProductQuantities = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.getProductQuantities(req.params.productId),
    }).send(res);
  };

  getProductSizes = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.getProductSizes(req.params.productId),
    }).send(res);
  };

  createProductQuantities = async (req, res, next) => {
    new CREATED({
      data: await ProductService.createProductQuantities(
        req.params.productId,
        req.body
      ),
    }).send(res);
  };

  // NEW METHODS
  getNewArrivals = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.getNewArrivals(
        req.query.limit ? +req.query.limit : 8
      ),
    }).send(res);
  };

  getBestSellers = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.getBestSellers(
        req.query.limit ? +req.query.limit : 8
      ),
    }).send(res);
  };

  getFeaturedProducts = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.getFeaturedProducts(
        req.query.limit ? +req.query.limit : 8
      ),
    }).send(res);
  };

  getHomepageData = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.getHomepageData(),
    }).send(res);
  };

  getRelatedProducts = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.getRelatedProducts(
        req.params.productId,
        req.query.limit ? +req.query.limit : 4
      ),
    }).send(res);
  };
}

module.exports = new ProductController();