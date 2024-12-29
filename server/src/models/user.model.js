"use strict";
//
const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "Users";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      trim: true,
      maxLength: 150,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
    roles: {
      type: [String],
      enum: ["ADMIN", "USER"],
      default: ["USER"],
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = {
  User: model(DOCUMENT_NAME, userSchema),
};
