"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const CategoryService = require("../services/category.service");

class CategorynController {
  createNewCategory = async (req, res, next) => {
    const categoryData = { ...req.body };

    // Add image path if file was uploaded
    if (req.file) {
      categoryData.image = `uploads/${req.file.filename}`;
    }

    new CREATED({
      data: await CategoryService.createNewCategory(categoryData),
    }).send(res);
  };
  deleteCategory = async (req, res, next) => {
    const { id } = req.params;
    new SuccessResponse({
      data: await CategoryService.deleteCategory(id),
    }).send(res);
  };
  getAllCategories = async (req, res, next) => {
    new SuccessResponse({
      data: await CategoryService.getAllCategories(req.query),
    }).send(res);
  };
  updateCategory = async (req, res, next) => {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Add image path if file was uploaded
    if (req.file) {
      updateData.image = `uploads/${req.file.filename}`;
    }

    new SuccessResponse({
      data: await CategoryService.updateCategory(id, updateData),
    }).send(res);
  };
}
module.exports = new CategorynController();
