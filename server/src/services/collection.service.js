"use strict";

const { default: mongoose } = require("mongoose");
const { NotFoundError } = require("../core/error.response");
const { Collection } = require("../models/collection.model");
const { paginate } = require("../utils/paginate");

class CollectionService {
  static createNewCollection = async (data) => {
    const collection = await Collection.create(data);
    return collection;
  };

  static getAllCollections = async ({
    limit = 10,
    page = 1,
    filters = { status: "active" },
    options,
    ...query
  }) => {
    let collections = await paginate({
      model: Collection,
      limit: +limit,
      page: +page,
      filters,
      options,
      populate: ["products"],
    });
    return collections;
  };

  static deleteCollection = async (id) => {
    try {
      const updatedCollection = await Collection.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        { status: "inActive" },
        { new: true }
      );

      if (!updatedCollection) {
        throw new NotFoundError("Collection not found");
      }

      return updatedCollection;
    } catch (error) {
      throw new Error(`Error updating collection: ${error.message}`);
    }
  };

  static updateCollection = async (id, payload) => {
    const isExist = await Collection.findOne({ _id: id });

    if (!isExist) {
      throw new NotFoundError("Collection not found!");
    }

    const result = await Collection.findOneAndUpdate({ _id: id }, payload, {
      new: true,
    });
    return result;
  };
}

module.exports = CollectionService;
