"use strict";

const { createChecksum, sortObject } = require("../utils");
const moment = require("moment");
let crypto = require("crypto");
let querystring = require("qs");

class PaymentService {
  static payment = async (req) => {
    process.env.TZ = "Asia/Ho_Chi_Minh";

    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");
    let expireDate = moment(date).add(3, "minutes").format("YYYYMMDDHHmmss"); // Thời gian hết hạn thanh toán (15 phút sau)
    let ipAddr = "172.0.0.1";

    let config = require("../config/default.json");

    let tmnCode = config.vnp_TmnCode;
    let secretKey = config.vnp_HashSecret;
    let vnpUrl = config.vnp_Url;
    let returnUrl = config.vnp_ReturnUrl;
    let orderId = moment(date).format("DDHHmmss"); // Mã tham chiếu đơn hàng
    let amount = req.body.amount;
    let bankCode = req.body.bankCode || ""; // Mã ngân hàng (tùy chọn)
    let locale = req.body.language || "vn"; // Ngôn ngữ (mặc định là Tiếng Việt)
    let orderInfo = req.body.orderInfo || "Thanh toan cho ma GD " + orderId; // Thông tin đơn hàng
    let orderType = req.body.orderType || "other"; // Loại đơn hàng (mặc định là 'other')

    let currCode = "VND"; // Đơn vị tiền tệ (chỉ hỗ trợ VND)

    // Tạo đối tượng chứa các tham số gửi đến VNPay
    let vnp_Params = {
      vnp_Version: "2.1.0", // Phiên bản API
      vnp_Command: "pay", // Lệnh thanh toán
      vnp_TmnCode: tmnCode, // Mã website của merchant
      vnp_Amount: amount * 100, // Số tiền thanh toán (nhân với 100)
      vnp_CreateDate: createDate, // Thời gian tạo giao dịch
      vnp_CurrCode: currCode, // Đơn vị tiền tệ
      vnp_IpAddr: ipAddr, // Địa chỉ IP của khách hàng
      vnp_Locale: locale, // Ngôn ngữ hiển thị
      vnp_OrderInfo: orderInfo, // Thông tin đơn hàng
      vnp_OrderType: orderType, // Loại đơn hàng
      vnp_ReturnUrl: returnUrl, // URL trả về sau khi thanh toán
      vnp_TxnRef: orderId, // Mã tham chiếu đơn hàng
      vnp_ExpireDate: expireDate, // Thời gian hết hạn thanh toán
      vnp_BankCode: "VNBANK",
    };

    // // Thêm mã ngân hàng nếu có
    // if (bankCode !== null && bankCode !== "") {
    //   vnp_Params["vnp_BankCode"] = bankCode;
    // }

    // Sắp xếp các tham số theo thứ tự alphabet
    vnp_Params = sortObject(vnp_Params);
    // Tạo chuỗi dữ liệu để tính toán checksum
    let signData = querystring.stringify(vnp_Params, { encode: false });

    // Tính toán checksum bằng SHA512
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // Thêm checksum vào danh sách tham số
    vnp_Params["vnp_SecureHash"] = signed;

    // Tạo URL thanh toán
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    return vnpUrl;
  };
  static vnpay_ipn = async (req) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params["vnp_SecureHash"];

    let orderId = vnp_Params["vnp_TxnRef"];
    let rspCode = vnp_Params["vnp_ResponseCode"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    let config = require("../config/default.json");

    let tmnCode = config.vnp_TmnCode;
    let secretKey = config.vnp_HashSecret;
    let vnpUrl = config.vnp_Url;
    let returnUrl = config.vnp_ReturnUrl;
    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

    let paymentStatus = "0"; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
    //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
    //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

    let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
    let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
    if (secureHash === signed) {
      //kiểm tra checksum
      if (checkOrderId) {
        if (checkAmount) {
          if (paymentStatus == "0") {
            //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
            if (rspCode == "00") {
              //thanh cong
              //paymentStatus = '1'
              // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
              return { RspCode: "00", Message: "Success" };
            } else {
              //that bai
              //paymentStatus = '2'
              // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
              return { RspCode: "00", Message: "Success" };
            }
          } else {
            return {
              RspCode: "02",
              Message: "This order has been updated to the payment status",
            };
          }
        } else {
          return { RspCode: "04", Message: "Amount invalid" };
        }
      } else {
        return { RspCode: "01", Message: "Order not found" };
      }
    } else {
      return { RspCode: "97", Message: "Checksum failed" };
    }
  };
  static vnpay_return = async (req) => {
    let vnp_Params = req.query;

    let secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    let config = require("../config/default.json");

    let tmnCode = config.vnp_TmnCode;
    let secretKey = config.vnp_HashSecret;
    let vnpUrl = config.vnp_Url;
    let returnUrl = config.vnp_ReturnUrl;

    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

      return { code: vnp_Params["vnp_ResponseCode"] };
    } else {
      return { code: "97" };
    }
  };
}

module.exports = PaymentService;
