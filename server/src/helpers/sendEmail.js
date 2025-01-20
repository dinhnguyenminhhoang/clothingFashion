const nodemailer = require("nodemailer");

// Cấu hình transporter (SMTP server)
const transporter = nodemailer.createTransport({
  service: "gmail", // Bạn có thể thay bằng dịch vụ khác (Outlook, Mailgun, ...)
  auth: {
    user: "hoangdevfe@gmail.com", // Email của bạn
    pass: "wbls qtcy lezi ligf", // Mật khẩu ứng dụng
  },
});

/**
 * Hàm gửi email tái sử dụng
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} html - Nội dung HTML của email
 * @returns {Promise<string>} - Trả về thông báo gửi email thành công hoặc lỗi
 */
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: "hoangdevfe@gmail.com", // Email người gửi
      to, // Email người nhận
      subject, // Tiêu đề email
      html, // Nội dung email (dạng HTML)
    };

    await transporter.sendMail(mailOptions);
    return "Email đã được gửi thành công.";
  } catch (error) {
    throw new Error("Gửi email thất bại: " + error.message);
  }
};

module.exports = sendEmail;
