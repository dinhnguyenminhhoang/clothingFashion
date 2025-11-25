"use strict";

const express = require("express");
const { asynchandler } = require("../helpers/asynchandler");
const { adminAuthentication } = require("../auth/authUtils");
const uploadController = require("../controller/upload.controller");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const router = express.Router();

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.use("/uploads", express.static(uploadsDir));

router.post(
  "/upload",
  adminAuthentication,
  upload.array("file", 10),
  asynchandler(uploadController.uploadProduct)
);

module.exports = router;