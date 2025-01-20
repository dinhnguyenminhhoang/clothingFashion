const orderContent = (order) => {
  return `
            <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f9f9f9;">
            <h2 style="color: #4CAF50;">Chi tiết đơn hàng</h2>
            <ul style="list-style-type: none; padding: 0;">
              ${order?.cart
                ?.map(
                  (item) => `
                    <li style="margin-bottom: 8px;margin-left:0">
                      <strong>${item.productName}</strong> - 
                      Số lượng: <strong>${item.quantity}</strong>, 
                      Kích thước: <strong>${item.size}</strong>
                    </li>`
                )
                .join("")}
            </ul>
            <p><strong>Tổng tiền:</strong> ${order.totalAmount.toLocaleString(
              "vi-VN",
              {
                style: "currency",
                currency: "VND",
              }
            )}</p>
            <p><strong>Số điện thoại:</strong> ${order.phone}</p>
            <p><strong>Địa chỉ:</strong> ${order.address}</p>
            <p><strong>Phương thức thanh toán:</strong> ${
              order.paymentMethod === "cash"
                ? "Thanh toán khi nhận hàng"
                : "Thanh toán qua thẻ"
            }</p>
          </div>
          <p style="margin-top: 20px;">Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ chúng tôi qua email hoặc hotline của cửa hàng.</p>
          <p style="text-align: center; color: #888; font-size: 0.9em; margin-top: 30px;">
            <em>Trân trọng,<br />Đội ngũ hỗ trợ khách hàng</em>
          </p>
        </div>`;
};
const confirmOrderForm = (order) => {
  return {
    title: "Thông tin đơn hàng của bạn",
    body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #4CAF50; text-align: center;">Cảm ơn quý khách đã đặt hàng!</h1>
          <p>Xin chào,</p>
          <p>Đây là thông tin chi tiết về đơn hàng của bạn:</p>
          ${orderContent(order)}
        </div>
      `,
  };
};
const processingOrderForm = (orderId, order) => {
  return {
    title: `Đơn hàng #${orderId} của bạn đang được xử lý`,
    body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #FFA500; text-align: center;">Đơn hàng đang được xử lý</h1>
          <p>Xin chào,</p>
          <p>Đơn hàng của bạn hiện đang được xử lý. Chúng tôi sẽ sớm gửi thông tin cập nhật tiếp theo.</p>
          ${orderContent(order)}
        </div>
      `,
  };
};

const deliveredOrderForm = (orderId, order) => {
  return {
    title: `Đơn hàng #${orderId} của bạn đã được giao`,
    body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #4CAF50; text-align: center;">Đơn hàng đã được giao thành công!</h1>
          <p>Chúng tôi hy vọng bạn hài lòng với sản phẩm. Nếu cần hỗ trợ, vui lòng liên hệ với chúng tôi.</p>
          ${orderContent(order)}
        </div>
      `,
  };
};

const cancelOrderForm = (orderId, order) => {
  return {
    title: `Đơn hàng #${orderId} của bạn đã bị hủy`,
    body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #FF0000; text-align: center;">Đơn hàng đã bị hủy</h1>
          <p>Chúng tôi rất tiếc phải thông báo rằng đơn hàng của bạn đã bị hủy. Nếu đây là nhầm lẫn, vui lòng liên hệ với chúng tôi để được hỗ trợ.</p>
          ${orderContent(order)}
        </div>
      `,
  };
};
const resetPasswordForm = (resetLink) => {
  return {
    title: "Đặt lại mật khẩu",
    body: `<p>Nhấn vào liên kết dưới đây để đặt lại mật khẩu:</p>
           <a href="${resetLink}">${resetLink}</a>`,
  };
};
module.exports = {
  confirmOrderForm,
  processingOrderForm,
  deliveredOrderForm,
  cancelOrderForm,
  resetPasswordForm,
};
