import {
  BankOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Button, Input, Modal, message, Card, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QrCodeForm from "../../Components/FormManage/QrCodeForm";
import useNotification from "../../hooks/NotiHook";
import {
  createOrder,
  createVnPayOrder,
  userUpdateStatus,
} from "../../service/orderService";
import { getAddresses } from "../../service/userService";
import { formatCurrencyVND } from "../../utils";
import { IMAGEURL } from "../../utils/constant";
import AddressManager from "../../Components/Address/AddressManager";
import { validateVoucher, getActiveVouchers } from "../../service/voucherService";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const openNotification = useNotification();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showQrModal, setShowQRModal] = useState(false);
  const [draftOrder, setDraftOrder] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const navigator = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    fetchDefaultAddress();
    fetchActiveVouchers();
  }, []);

  const fetchDefaultAddress = async () => {
    try {
      const res = await getAddresses();
      if (res.status === 200) {
        const addressData = res.data.data || res.data || [];
        const addresses = Array.isArray(addressData) ? addressData : [];
        
        if (addresses.length > 0) {
          const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
          setDeliveryInfo(defaultAddr);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses", error);
    }
  };

  const fetchActiveVouchers = async () => {
    try {
      const res = await getActiveVouchers();
      if (res.status === 200) {
        setAvailableVouchers(res.data.slice(0, 4)); // Show top 4 vouchers
      }
    } catch (error) {
      console.error("Error fetching vouchers", error);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      message.warning("Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      setCheckingVoucher(true);
      setVoucherError("");

      const orderData = {
        totalAmount: calculateTotal(),
        products: cart.map(item => ({ _id: item._id }))
      };

      const res = await validateVoucher(voucherCode, orderData);

      if (res.status === 200) {
        setAppliedVoucher(res.data);
        message.success(`Áp dụng mã giảm ${formatCurrencyVND(res.data.discount)} thành công!`);
      }
    } catch (error) {
      setVoucherError(error.response?.data?.message || "Mã giảm giá không hợp lệ");
      setAppliedVoucher(null);
    } finally {
      setCheckingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setAppliedVoucher(null);
    setVoucherError("");
  };

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  const handleIncreaseQuantity = (index) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity += 1;
    setCart(updatedCart);
  };

  const handleDecreaseQuantity = (index) => {
    const updatedCart = [...cart];
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
      setCart(updatedCart);
    }
  };

  const handleRemoveItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    if (updatedCart.length === 0) {
        localStorage.removeItem("cart");
    }
  };

  const calculateTotal = () => {
    const totalProductPrice = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    return totalProductPrice;
  };

  const handleCreateOrder = async () => {
    try {
      setIsProcessing(true);
      const filteredCart = cart.map((item) => ({
        product: item._id,
        productName: item.title,
        quantity: item.quantity,
        size: item.size,
      }));

      if (paymentMethod === "vnpay") {
        const orderData = {
          ...deliveryInfo,
          paymentMethod: "draftVnpay",
          totalAmount: calculateTotal(),
          voucherCode: appliedVoucher?.voucher?.code || null,
          cart: filteredCart,
        };

        const res = await createVnPayOrder(orderData);
        if (res.status === 200) {
          window.location.href = res.data;
        } else {
          message.error("Không thể tạo giao dịch VNPay. Vui lòng thử lại sau!");
        }
      } else if (paymentMethod === "cash") {
        const res = await createOrder({
          ...deliveryInfo,
          paymentMethod: paymentMethod,
          totalAmount: calculateTotal(),
          voucherCode: appliedVoucher?.voucher?.code || null,
          cart: filteredCart,
        });

        if (res.status === 201) {
          message.success("Đặt hàng thành công");
          localStorage.removeItem("cart");
          navigator("/history-order");
        }
      } else if (paymentMethod === "credit") {
        const res = await createOrder({
          ...deliveryInfo,
          paymentMethod: paymentMethod,
          totalAmount: calculateTotal(),
          voucherCode: appliedVoucher?.voucher?.code || null,
          cart: filteredCart,
        });

        setDraftOrder(res.data);
        setShowQRModal(true);
      }
    } catch (error) {
      openNotification({
        type: "error",
        message: "Thông báo",
        error: error,
      });
    } finally {
      setIsProcessing(false);
      setShowPaymentModal(false);
    }
  };

  const handleCancelPaymentOnline = async () => {
    try {
      const res = await userUpdateStatus({ status: "cancel" }, draftOrder?._id);
      if (res) {
        setDraftOrder(null);
        setShowQRModal(false);
        openNotification({
          typpe: "error",
          message: "Thông báo",
          description: "Đơn hàng đã bị hủy",
        });
      }
    } catch (error) {}
  };

  const handleConfirmPaymentQrCode = () => {
    openNotification({
      message: "Thông báo",
      description: "Đặt hàng thành công",
    });
    localStorage.removeItem("cart");
    navigator("/history-order");
  };

  const handleSelectAddress = (address) => {
    setDeliveryInfo(address);
    setShowAddressModal(false);
    message.success("Đã chọn địa chỉ giao hàng");
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Giỏ Hàng Của Bạn</h2>
      {cart.length ? (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side: Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-center gap-4 p-6 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={IMAGEURL + item.img}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">Size: <span className="font-medium text-black">{item.size}</span></p>
                    <div className="font-bold text-blue-600">
                      {formatCurrencyVND(item.price * item.quantity)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                    <Button
                      type="text"
                      icon={<MinusOutlined />}
                      onClick={() => handleDecreaseQuantity(index)}
                      size="small"
                      className="flex items-center justify-center"
                    />
                    <span className="text-base font-medium w-8 text-center">{item.quantity}</span>
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => handleIncreaseQuantity(index)}
                      size="small"
                      className="flex items-center justify-center"
                    />
                  </div>
                  
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveItem(index)}
                    className="hover:bg-red-50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Order Summary & Delivery */}
          <div className="w-full lg:w-96 space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <EnvironmentOutlined className="text-blue-500" />
                  Địa Chỉ Giao Hàng
                </h3>
                <Button type="link" onClick={() => setShowAddressModal(true)}>
                  {deliveryInfo ? "Thay đổi" : "Thêm mới"}
                </Button>
              </div>
              
              {deliveryInfo ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">{deliveryInfo.recipientName}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-600">{deliveryInfo.phone}</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {deliveryInfo.address}
                  </p>
                  {deliveryInfo.isDefault && (
                    <Tag color="blue" className="mt-2">Mặc định</Tag>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                  Chưa có địa chỉ giao hàng
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Tổng Quan Đơn Hàng</h3>
              
              {/* Voucher Section */}
              <div className="mb-4 pb-4 border-b">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  🎟️ Mã giảm giá
                </label>
                
                {/* Available Vouchers */}
                {availableVouchers.length > 0 && !appliedVoucher && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Có sẵn cho bạn:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {availableVouchers.map(v => (
                        <div 
                          key={v._id}
                          className="border border-dashed border-blue-300 rounded p-2 cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => setVoucherCode(v.code)}
                        >
                          <Tag color="red" className="text-xs">{v.code}</Tag>
                          <p className="text-xs text-gray-600 line-clamp-1">{v.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Voucher Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập mã giảm giá"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    disabled={!!appliedVoucher}
                    status={voucherError ? "error" : ""}
                    className="flex-1"
                  />
                  {appliedVoucher ? (
                    <Button onClick={handleRemoveVoucher} danger>
                      Xóa
                    </Button>
                  ) : (
                    <Button 
                      type="primary" 
                      onClick={handleApplyVoucher}
                      loading={checkingVoucher}
                      disabled={!voucherCode.trim()}
                    >
                      Áp dụng
                    </Button>
                  )}
                </div>
                
                {/* Error Message */}
                {voucherError && (
                  <p className="text-red-500 text-xs mt-1">❌ {voucherError}</p>
                )}
                
                {/* Success Message */}
                {appliedVoucher && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-sm font-medium flex items-center gap-1">
                      <CheckCircleOutlined /> {appliedVoucher.voucher.description}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Tiết kiệm: {formatCurrencyVND(appliedVoucher.discount)}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Price Breakdown */}
              <div className="flex justify-between items-center mb-4 text-gray-600">
                <span>Tạm tính</span>
                <span>{formatCurrencyVND(calculateTotal())}</span>
              </div>
              
              {appliedVoucher && (
                <div className="flex justify-between items-center mb-4 text-green-600 font-medium">
                  <span>Giảm giá ({appliedVoucher.voucher.code})</span>
                  <span>-{formatCurrencyVND(appliedVoucher.discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center mb-6 text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="text-green-600 font-medium">Miễn phí</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-gray-900">Tổng cộng</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrencyVND(
                    appliedVoucher 
                      ? appliedVoucher.finalAmount 
                      : calculateTotal()
                  )}
                </span>
              </div>
              
              <Button
                type="primary"
                size="large"
                block
                onClick={() => setShowPaymentModal(true)}
                className="h-12 text-lg font-bold bg-black hover:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-all"
                disabled={!deliveryInfo}
                loading={isProcessing}
              >
                Tiến Hành Thanh Toán
              </Button>
              {!deliveryInfo && (
                <p className="text-red-500 text-xs text-center mt-2">
                  Vui lòng chọn địa chỉ giao hàng để tiếp tục
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
          <ShoppingCartOutlined className="text-6xl text-gray-200 mb-4" />
          <p className="text-xl font-medium text-gray-500 mb-6">Giỏ hàng của bạn đang trống</p>
          <Button type="primary" size="large" onClick={() => navigator("/shop")}>
            Tiếp tục mua sắm
          </Button>
        </div>
      )}

      {/* Modals */}
      <Modal
        title="Chọn Địa Chỉ Giao Hàng"
        visible={showAddressModal}
        onCancel={() => setShowAddressModal(false)}
        footer={null}
        width={700}
      >
        <AddressManager 
          mode="select" 
          onSelect={handleSelectAddress} 
          selectedId={deliveryInfo?._id} 
        />
      </Modal>

      {showQrModal && (
        <Modal
          visible={showQrModal}
          onCancel={handleCancelPaymentOnline}
          footer={[
            <Button key="cancel" type="primary" danger onClick={handleCancelPaymentOnline}>
              Hủy
            </Button>,
            <Button key="confirm" type="primary" onClick={handleConfirmPaymentQrCode}>
              Xác nhận thanh toán
            </Button>,
          ]}
        >
          <QrCodeForm
            draftOrder={draftOrder}
            onCancel={handleCancelPaymentOnline}
          />
        </Modal>
      )}

      <Modal
        visible={showPaymentModal}
        onCancel={() => setShowPaymentModal(false)}
        footer={[
          <Button
            key="cancel"
            type="text"
            onClick={() => setShowPaymentModal(false)}
          >
            Hủy
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleCreateOrder}
            loading={isProcessing}
            className="bg-black hover:bg-gray-800 border-none"
          >
            Xác nhận đặt hàng
          </Button>,
        ]}
      >
        <h3 className="font-bold text-xl mb-6 text-center">
          Phương Thức Thanh Toán
        </h3>
        <div className="space-y-3">
          {[
            { id: "cash", icon: <ShoppingCartOutlined />, label: "Thanh toán khi nhận hàng (COD)" },
            { id: "credit", icon: <CreditCardOutlined />, label: "Chuyển khoản ngân hàng (QR Code)" },
            { id: "vnpay", icon: <BankOutlined />, label: "Ví điện tử VNPAY" },
          ].map((method) => (
            <div
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                paymentMethod === method.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`text-2xl mr-4 ${paymentMethod === method.id ? "text-blue-500" : "text-gray-400"}`}>
                {method.icon}
              </div>
              <span className={`font-medium flex-1 ${paymentMethod === method.id ? "text-blue-900" : "text-gray-700"}`}>
                {method.label}
              </span>
              {paymentMethod === method.id && (
                <CheckCircleOutlined className="text-blue-500 text-xl" />
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Cart;
