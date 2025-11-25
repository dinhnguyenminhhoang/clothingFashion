"use strict";

const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { badRequestError, NotFoundError } = require("../core/error.response");
const { Order } = require("../models/order.model");

const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.originalname.endsWith(".docx")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file .docx"), false);
  }
};

const uploadDocx = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const numberToWords = (num) => {
  if (num === 0) return "Không đồng";

  const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const teens = [
    "mười",
    "mười một",
    "mười hai",
    "mười ba",
    "mười bốn",
    "mười lăm",
    "mười sáu",
    "mười bảy",
    "mười tám",
    "mười chín",
  ];
  const scales = ["", "nghìn", "triệu", "tỷ"];

  function convertGroup(n) {
    if (n === 0) return "";
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];

    const tens = Math.floor(n / 10);
    const ones = n % 10;

    let result = units[tens] + " mươi";
    if (ones === 1) result += " mốt";
    else if (ones === 5 && tens >= 1) result += " lăm";
    else if (ones > 0) result += " " + units[ones];

    return result;
  }

  const groups = [];
  while (num > 0) {
    groups.push(num % 1000);
    num = Math.floor(num / 1000);
  }

  let result = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      const groupText = convertGroup(groups[i]);
      result += groupText + " " + scales[i] + " ";
    }
  }

  return result.trim() + " đồng";
};

const getStatusText = (status) => {
  const statusMap = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    delivered: "Đã giao hàng",
    cancel: "Đã hủy",
  };
  return statusMap[status] || status;
};

const swapDocxData = (file, data) => {
  if (!file) {
    throw new badRequestError("Vui lòng upload file DOCX template");
  }

  if (!data) {
    throw new badRequestError("Vui lòng cung cấp dữ liệu để thay thế");
  }

  try {
    const parsedData = typeof data === "string" ? JSON.parse(data) : data;
    const content = fs.readFileSync(file.path, "binary");
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.setData(parsedData);
    doc.render();

    const buffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    fs.unlinkSync(file.path);
    return buffer;
  } catch (error) {
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    if (error.properties && error.properties.errors) {
      throw new badRequestError(
        `Template error: ${JSON.stringify(error.properties.errors)}`
      );
    }
    throw new badRequestError(`Lỗi xử lý file DOCX: ${error.message}`);
  }
};

const docxSwapperMiddleware = {
  swapCustom: async (req, res, next) => {
    try {
      const buffer = swapDocxData(req.file, req.body.data);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="output-${Date.now()}.docx"`
      );

      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  },

  swapOrder: async (req, res, next) => {
    try {
      const { orderId } = req.params;

      const order = await Order.findById(orderId)
        .populate("user")
        .populate({
          path: "cart.product",
          populate: { path: "brand category" },
        })
        .lean();

      if (!order) {
        throw new NotFoundError("Không tìm thấy đơn hàng");
      }

      const data = {
        orderNumber: order._id.toString(),
        orderDate: new Date(order.createdAt).toLocaleDateString("vi-VN"),
        customerName: order.recipientName || order.user?.userName || "N/A",
        customerEmail: order.user?.email || "N/A",
        customerPhone: order.phone || "N/A",
        address: order.address || "N/A",
        paymentMethod:
          order.paymentMethod === "cash"
            ? "Thanh toán khi nhận hàng"
            : "Thanh toán online",
        status: getStatusText(order.status),
        items: order.cart.map((item, index) => ({
          no: index + 1,
          productName: item.product?.title || "N/A",
          brand: item.product?.brand?.name || "N/A",
          category: item.product?.category?.name || "N/A",
          size: item.size || "N/A",
          quantity: item.quantity,
          price: (item.product?.price || 0).toLocaleString("vi-VN"),
          total: ((item.product?.price || 0) * item.quantity).toLocaleString("vi-VN"),
        })),
        subtotal: order.totalAmount.toLocaleString("vi-VN"),
        total: order.totalAmount.toLocaleString("vi-VN"),
        totalInWords: numberToWords(order.totalAmount),
      };

      const buffer = swapDocxData(req.file, data);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="order-${orderId}-${Date.now()}.docx"`
      );

      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = {
  uploadDocx,
  docxSwapperMiddleware,
};