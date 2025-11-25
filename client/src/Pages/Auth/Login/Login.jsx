import { LockOutlined, UserOutlined, GoogleOutlined, FacebookFilled } from "@ant-design/icons";
import { Checkbox, Divider, Form, Input, Space, Typography, Button } from "antd";
import Cookies from "js-cookie";
import React, { useState } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import { motion } from "framer-motion";
import useNotification from "../../../hooks/NotiHook";
import BtnLoading from "../../../Components/BtnLoading/BtnLoading";
import { customerLoginAPi } from "../../../service/authService";
import { jwtDecode } from "jwt-decode";

const { Title, Text } = Typography;

const Login = () => {
  const navigator = useNavigate();
  const openNotification = useNotification();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let response = await customerLoginAPi(values);
      if (response.status === 200) {
        openNotification({
          type: "success",
          message: "Chào mừng trở lại!",
          description: "Đăng nhập thành công",
        });
        Cookies.set("token", response.data.tokens.accessToken);
        Cookies.set("userId", response.data.user._id);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        const decode = jwtDecode(response.data.tokens.accessToken);
        if (decode?.role?.includes("ADMIN")) {
          navigator("/dashboard");
        } else navigator("/");
      } else {
        openNotification({
          type: "error",
          message: "Đăng nhập thất bại",
          description: "Vui lòng kiểm tra lại thông tin đăng nhập",
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
      message: "Thông tin chưa đầy đủ",
      description: "Vui lòng điền đầy đủ các trường bắt buộc",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-lg min-w-[400px] z-10 relative border border-white/50"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Đăng nhập để tiếp tục mua sắm</p>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-500" />}
              placeholder="Email"
              className="rounded-xl bg-white/50 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-500" />}
              placeholder="Mật khẩu"
              className="rounded-xl bg-white/50 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
            />
          </Form.Item>

          <div className="flex justify-between items-center mb-6">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="text-gray-600">Ghi nhớ</Checkbox>
            </Form.Item>
            <span
              onClick={() => navigator("/forgot-password")}
              className="text-blue-600 cursor-pointer hover:text-blue-800 font-semibold text-sm transition-colors"
            >
              Quên mật khẩu?
            </span>
          </div>

          <Form.Item>
            <BtnLoading
              loading={loading}
              className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white h-12 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 border-none"
              htmlType="submit"
            >
              ĐĂNG NHẬP
            </BtnLoading>
          </Form.Item>
        </Form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/0 backdrop-blur-md text-gray-500 font-medium">Hoặc tiếp tục với</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
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
            Chưa có tài khoản?{" "}
            <span
              onClick={() => navigator("/register")}
              className="text-blue-600 cursor-pointer font-bold hover:underline ml-1"
            >
              Đăng ký ngay
            </span>
          </Text>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
