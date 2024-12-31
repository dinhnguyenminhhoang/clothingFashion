"use strict";

const { CREATED, SuccessResponse, OK } = require("../core/success.response");
const ProductService = require("../services/product.service");

class ProductController {
  createNewProduct = async (req, res, next) => {
    new CREATED({
      data: await ProductService.createNewProduct(req.body),
    }).send(res);
  };
  updateProduct = async (req, res, next) => {
    const { id } = req.params;
    new SuccessResponse({
      data: await ProductService.updateProduct(id, req.body),
    }).send(res);
  };
  getAllProducts = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.getAllProducts(),
    }).send(res);
  };
  getProductdetail = async (req, res, next) => {
    const { id } = req.params;
    new SuccessResponse({
      data: await ProductService.getProductDetail(id),
    }).send(res);
  };
  getPopularProductByType = async (req, res, next) => {
    const type = req.params.type;
    const query = req.query;
    new SuccessResponse({
      data: await ProductService.getPopularProductByType(type, query),
    }).send(res);
  };
  getProductType = async (req, res, next) => {
    const type = req.params.type;
    const query = req.query;
    new SuccessResponse({
      data: await ProductService.getProductType(type, query),
    }).send(res);
  };
  getTopRatedProduct = async (req, res, next) => {
    new SuccessResponse({
      data: await ProductService.getTopRatedProduct(),
    }).send(res);
  };
}
module.exports = new ProductController();
