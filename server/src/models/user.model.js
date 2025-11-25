"use strict";
//
const { model, Schema, default: mongoose } = require("mongoose");
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
      type: String,
      enum: ["active", "inActive"],
      default: "active",
    },
    roles: {
      type: [String],
      enum: ["ADMIN", "USER"],
      default: ["USER"],
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    verificationCode: {
      type: String,
      default: null,
    },
    verificationCodeExpiry: {
      type: Date,
      default: null,
    },
    verificationCodeType: {
      type: String,
      enum: ["confirm", "resetPassword", null],
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    address: [
      {
        recipientName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = {
  User: model(DOCUMENT_NAME, userSchema),
};