"use strict";
const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "Favorite";
const COLLECTION_NAME = "Favorites";

const favoriteSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
    },
    { timestamps: true, collection: COLLECTION_NAME }
);

// Ensure a user can only favorite a product once
favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = {
    Favorite: model(DOCUMENT_NAME, favoriteSchema),
};
