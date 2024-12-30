"use strict";
const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cart: [
      {
        type: Schema.Types.Object,
        ref: "Product",
      },
    ],
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "credit"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "delivered", "cancel"],
      default: "pending",
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = {
  Order: model(DOCUMENT_NAME, orderSchema),
};
