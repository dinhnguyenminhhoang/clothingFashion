"use strict";
//
const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a name for this product."],
      trim: true,
      minLength: [3, "Name must be at least 3 characters."],
      maxLength: [200, "Name is too large"],
    },
    img: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Product price can't be negative"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Product quantity can't be negative"],
    },
    productType: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    sizes: [String],
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["in-stock", "out-of-stock"],
      },
      default: "in-stock",
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = {
  Product: model(DOCUMENT_NAME, productSchema),
};
