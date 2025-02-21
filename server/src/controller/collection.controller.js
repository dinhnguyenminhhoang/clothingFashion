"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const CollectionService = require("../services/collection.service");

class CollectionController {
  createNewCollection = async (req, res, next) => {
    new CREATED({
      data: await CollectionService.createNewCollection(req.body),
    }).send(res);
  };
  deleteCollection = async (req, res, next) => {
    const { id } = req.params;
    new SuccessResponse({
      data: await CollectionService.deleteCollection(id),
    }).send(res);
  };
  getAllCollection = async (req, res, next) => {
    new SuccessResponse({
      data: await CollectionService.getAllCollection(req.query),
    }).send(res);
  };
  updateCollection = async (req, res, next) => {
    const { id } = req.params;
    new SuccessResponse({
      data: await CollectionService.updateCollection(id, req.body),
    }).send(res);
  };
}
module.exports = new CollectionController();
