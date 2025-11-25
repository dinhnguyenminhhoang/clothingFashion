import React, { useState } from "react";
import { Button, Input, message } from "antd";
import { MailOutlined } from "@ant-design/icons";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      message.warning("Vui lòng nhập email!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      message.error("Email không hợp lệ!");
      return;
    }

    setLoading(true);
    // Simulate API call - replace with actual API when available
    setTimeout(() => {
      message.success("Đăng ký nhận tin thành công!");
      setEmail("");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-gradient-primary py-16">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center text-white">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <MailOutlined className="text-4xl" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Đăng ký nhận tin
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Nhận thông tin về sản phẩm mới, ưu đãi đặc biệt và tin tức thời trang
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Nhập email của bạn..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 px-4 rounded-lg"
              prefix={<MailOutlined className="text-gray-400" />}
            />
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="h-12 px-8 bg-white text-blue-600 hover:bg-gray-100 border-none font-semibold"
            >
              Đăng ký
            </Button>
          </form>
          <p className="text-sm mt-4 text-white/70">
            Chúng tôi tôn trọng quyền riêng tư của bạn. Hủy đăng ký bất cứ lúc nào.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
