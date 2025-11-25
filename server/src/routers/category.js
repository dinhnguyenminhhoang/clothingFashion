"use strict";
const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const { adminAuthentication } = require("../auth/authUtils");
const categoryController = require("../controller/category.controller");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Setup uploads directory
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post(
  "/category",
  adminAuthentication,
  upload.single("image"),
  asynchandler(categoryController.createNewCategory)
);

router.put(
  "/category/:id",
  adminAuthentication,
  upload.single("image"),
  asynchandler(categoryController.updateCategory)
);

router.get("/category", asynchandler(categoryController.getAllCategories));

router.delete(
  "/category/:id",
  adminAuthentication,
  asynchandler(categoryController.deleteCategory)
);

module.exports = router;