"use strict";

const { Favorite } = require("../models/favorite.model");
const { CREATED, SuccessResponse, OK } = require("../core/success.response");

class FavoriteController {
    // Get all favorites for current user
    getFavorites = async (req, res, next) => {
        const favorites = await Favorite.find({ user: req.user.userId })
            .populate("product")
            .sort({ createdAt: -1 });

        new SuccessResponse({
            message: "Get favorites successfully",
            data: favorites,
        }).send(res);
    };

    // Add product to favorites
    addFavorite = async (req, res, next) => {
        const { productId } = req.body;

        // Check if already favorited
        const existing = await Favorite.findOne({
            user: req.user.userId,
            product: productId,
        });

        if (existing) {
            new SuccessResponse({
                message: "Product already in favorites",
                data: existing,
            }).send(res);
            return;
        }

        const favorite = await Favorite.create({
            user: req.user.userId,
            product: productId,
        });

        const populated = await Favorite.findById(favorite._id).populate("product");

        new OK({
            message: "Added to favorites successfully",
            data: populated,
        }).send(res);
    };

    // Remove product from favorites
    removeFavorite = async (req, res, next) => {
        const { productId } = req.params;

        const result = await Favorite.findOneAndDelete({
            user: req.user.userId,
            product: productId,
        });

        if (!result) {
            new SuccessResponse({
                message: "Product not in favorites",
                data: null,
            }).send(res);
            return;
        }

        new SuccessResponse({
            message: "Removed from favorites successfully",
            data: result,
        }).send(res);
    };

    checkFavorite = async (req, res, next) => {
        const { productId } = req.params;

        const favorite = await Favorite.findOne({
            user: req.user.userId,
            product: productId,
        });

        new SuccessResponse({
            message: "Check favorite status",
            data: { isFavorited: !!favorite },
        }).send(res);
    };

    toggleFavorite = async (req, res, next) => {
        const { productId } = req.body;

        const existing = await Favorite.findOne({
            user: req.user.userId,
            product: productId,
        });

        if (existing) {
            await Favorite.findByIdAndDelete(existing._id);
            new SuccessResponse({
                message: "Removed from favorites",
                data: { isFavorited: false },
            }).send(res);
        } else {
            await Favorite.create({
                user: req.user.userId,
                product: productId,
            });
            new SuccessResponse({
                message: "Added to favorites",
                data: { isFavorited: true },
            }).send(res);
        }
    };

    // Sync favorites from localStorage (bulk add)
    syncFavorites = async (req, res, next) => {
        const { productIds } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            new SuccessResponse({
                message: "No products to sync",
                data: { added: 0, skipped: 0, errors: [] }
            }).send(res);
            return;
        }

        const results = {
            added: 0,
            skipped: 0,
            errors: []
        };

        for (const productId of productIds) {
            try {
                const existing = await Favorite.findOne({
                    user: req.user.userId,
                    product: productId
                });

                if (!existing) {
                    await Favorite.create({
                        user: req.user.userId,
                        product: productId
                    });
                    results.added++;
                } else {
                    results.skipped++;
                }
            } catch (error) {
                results.errors.push({ productId, error: error.message });
            }
        }

        new SuccessResponse({
            message: "Sync completed",
            data: results
        }).send(res);
    };

    // Check multiple products at once (bulk check)
    checkFavorites = async (req, res, next) => {
        const { productIds } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            new SuccessResponse({
                message: "No products to check",
                data: []
            }).send(res);
            return;
        }

        const favorites = await Favorite.find({
            user: req.user.userId,
            product: { $in: productIds }
        }).select('product').lean();

        const favoritedIds = new Set(favorites.map(f => f.product.toString()));

        const results = productIds.map(id => ({
            productId: id,
            isFavorited: favoritedIds.has(id.toString())
        }));

        new SuccessResponse({
            message: "Check favorites status",
            data: results
        }).send(res);
    };
}

module.exports = new FavoriteController();
