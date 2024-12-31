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
    sellCount: {
      type: Number,
      default: 0,
      min: 0,
    },
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
// Middleware pre-save
productSchema.pre("save", function (next) {
  if (this.quantity === 0) {
    this.status = "out-of-stock";
  } else {
    this.status = "in-stock";
  }
  next();
});

// Middleware pre-findOneAndUpdate
productSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.quantity === 0) {
    update.status = "out-of-stock";
  } else if (update.quantity > 0) {
    update.status = "in-stock";
  }

  this.setUpdate(update);
  next();
});
module.exports = {
  Product: model(DOCUMENT_NAME, productSchema),
};
