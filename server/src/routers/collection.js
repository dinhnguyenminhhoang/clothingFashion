"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const { adminAuthentication } = require("../auth/authUtils");
const collectionController = require("../controller/collection.controller");
const router = express.Router();

router.post(
  "/collection",
  adminAuthentication,
  asynchandler(collectionController.createNewCollection)
);

router.put(
  "/collection/:id",
  adminAuthentication,
  asynchandler(collectionController.updateCollection)
);

router.get("/collection", asynchandler(collectionController.getAllCollection));

router.delete(
  "/collection/:id",
  adminAuthentication,
  asynchandler(collectionController.deleteCollection)
);

module.exports = router;
