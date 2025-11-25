"use strict";

const express = require("express");
const { authentication } = require("../auth/authUtils");
const favoriteController = require("../controller/favorite.controller");
const { asynchandler } = require("../helpers/asynchandler");
const router = express.Router();

router.use(authentication);

router.get("/", asynchandler(favoriteController.getFavorites));

router.post("/toggle", asynchandler(favoriteController.toggleFavorite));

router.post("/", asynchandler(favoriteController.addFavorite));

router.get("/check/:productId", asynchandler(favoriteController.checkFavorite));

router.delete("/:productId", asynchandler(favoriteController.removeFavorite));

router.post("/sync", asynchandler(favoriteController.syncFavorites));

router.post("/check-bulk", asynchandler(favoriteController.checkFavorites));

module.exports = router;
