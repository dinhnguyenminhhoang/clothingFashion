import { LockOutlined, PhoneOutlined, UserOutlined, GoogleOutlined, FacebookFilled } from "@ant-design/icons";
import { Button, Divider, Form, Input, Typography, Checkbox } from "antd";
import React, { useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useNotification from "../../../hooks/NotiHook";
import { customerRegisterApi } from "../../../service/authService";

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const openNotification = useNotification();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await customerRegisterApi(values);
      if (response.status === 201) {
        openNotification({
          type: "success",
          message: "Đăng ký thành công!",
          description: "Vui lòng kiểm tra email để xác thực tài khoản.",
        });
        navigate("/login");
      } else {
        openNotification({
          type: "error",
          message: "Đăng ký thất bại",
          description: "Có lỗi xảy ra, vui lòng thử lại sau.",
        });
      }
    } catch (error) {
      openNotification({
        type: "error",
        message: "Lỗi hệ thống",
        error: error,
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    openNotification({
      type: "warning",
      message: "Thông tin chưa hợp lệ",
      description: "Vui lòng kiểm tra lại các trường thông tin.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-10">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-3xl min-w-[500px] z-10 relative border border-white/50"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Tạo Tài Khoản Mới</h1>
          <p className="text-gray-600">Tham gia cộng đồng thời trang của chúng tôi</p>
        </div>

        <Form
          name="register"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          size="large"
          className="grid grid-cols-1 md:grid-cols-2 gap-x-6"
        >
          <Form.Item
            name="userName"
            className="col-span-2 md:col-span-1"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              { min: 4, message: "Tên đăng nhập phải dài hơn 3 ký tự!" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-500" />}
              placeholder="Tên đăng nhập"
              className="rounded-xl bg-white/50 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            className="col-span-2 md:col-span-1"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              { pattern: /^(03|05|07|08|09)\d{8}$/, message: "Số điện thoại không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<PhoneOutlined className="text-gray-500" />}
              placeholder="Số điện thoại"
              className="rounded-xl bg-white/50 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
            />
          </Form.Item>

          <Form.Item
            name="email"
            className="col-span-2"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MdOutlineEmail className="text-gray-500" />}
              placeholder="Email của bạn"
              className="rounded-xl bg-white/50 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
            />
          </Form.Item>

          <Form.Item
            name="password"
            className="col-span-2 md:col-span-1"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: "Mật khẩu yếu (cần chữ hoa, thường, số, ký tự đặc biệt)",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-500" />}
              placeholder="Mật khẩu"
              className="rounded-xl bg-white/50 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            className="col-span-2 md:col-span-1"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-500" />}
              placeholder="Xác nhận mật khẩu"
              className="rounded-xl bg-white/50 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
            />
          </Form.Item>

          <div className="col-span-2 mb-4">
            <Checkbox className="text-gray-600">
              Tôi đồng ý với <span className="text-blue-600 cursor-pointer hover:underline font-medium">Điều khoản dịch vụ</span> & <span className="text-blue-600 cursor-pointer hover:underline font-medium">Chính sách bảo mật</span>
            </Checkbox>
          </div>

          <Form.Item className="col-span-2 mb-0">
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white h-12 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 border-none"
              loading={loading}
              disabled={loading}
            >
              ĐĂNG KÝ NGAY
            </Button>
          </Form.Item>
        </Form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/0 backdrop-blur-md text-gray-500 font-medium">Hoặc đăng ký với</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            icon={<GoogleOutlined />} 
            className="flex items-center justify-center h-11 rounded-xl border-gray-300 hover:border-gray-400 hover:bg-white transition-all font-medium"
          >
            Google
          </Button>
          <Button 
            icon={<FacebookFilled className="text-blue-600" />} 
            className="flex items-center justify-center h-11 rounded-xl border-gray-300 hover:border-gray-400 hover:bg-white transition-all font-medium"
          >
            Facebook
          </Button>
        </div>

        <div className="text-center">
          <Text className="text-gray-600">
            Đã có tài khoản?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 cursor-pointer font-bold hover:underline ml-1"
            >
              Đăng nhập ngay
            </span>
          </Text>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
