"use strict";
//
const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "Collection";
const COLLECTION_NAME = "Collections";

const collectionSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide a collection name"],
      maxLength: 100,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inActive"],
      default: "active",
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = {
  Collection: model(DOCUMENT_NAME, collectionSchema),
};
