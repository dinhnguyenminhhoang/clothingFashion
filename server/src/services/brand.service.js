"use strict";

const { NotFoundError } = require("../core/error.response");
const { Brand } = require("../models/brand.model");

class BrandService {
  static createNewBrand = async (data) => {
    const brand = await Brand.create(data);
    return brand;
  };
  static getAllBrand = async () => {
    const brands = await Brand.find({ status: "active" }).populate("products");
    return brands;
  };
  static deleteBrand = async (id) => {
    const brands = await Brand.findByIdAndDelete(id);
    return brands;
  };
  static updateBrand = async (id, payload) => {
    const isExist = await Brand.findOne({ _id: id });

    if (!isExist) {
      throw new NotFoundError("Brand not found !");
    }

    const result = await Brand.findOneAndUpdate({ _id: id }, payload, {
      new: true,
    });
    return result;
  };
}
module.exports = BrandService;
