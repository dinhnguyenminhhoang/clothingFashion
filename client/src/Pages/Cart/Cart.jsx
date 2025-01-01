import React, { useState, useEffect } from "react";
import { Button, Input, Modal, message } from "antd";
import { MinusOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: "",
    recipientName: "",
    phoneNumber: "",
  });

  // Lấy giỏ hàng từ localStorage khi component được mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Cập nhật giỏ hàng vào localStorage khi cart thay đổi
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
  };

  const handleSubmitDeliveryInfo = () => {
    if (
      !deliveryInfo.address ||
      !deliveryInfo.recipientName ||
      !deliveryInfo.phoneNumber
    ) {
      message.error("Vui lòng nhập đầy đủ thông tin giao hàng!");
    } else {
      message.success("Thông tin giao hàng đã được lưu!");
      setShowDeliveryForm(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Giỏ Hàng</h2>
      <div className="space-y-4">
        {cart.map((item, index) => (
          <div
            key={item._id}
            className="flex justify-between items-center border-b py-4"
          >
            <div className="flex items-center">
              <img
                src={item.img}
                alt={item.title}
                className="w-20 h-20 object-cover mr-4"
              />
              <div>
                <h3 className="text-lg">{item.title}</h3>
                <p className="text-sm text-gray-500">Size: {item.size}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                icon={<MinusOutlined />}
                onClick={() => handleDecreaseQuantity(index)}
                size="small"
              />
              <span className="text-lg">{item.quantity}</span>
              <Button
                icon={<PlusOutlined />}
                onClick={() => handleIncreaseQuantity(index)}
                size="small"
              />
              <span className="ml-4">{item.price * item.quantity} VND</span>
              <Button
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveItem(index)}
                type="primary"
                danger
                size="small"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="primary" onClick={() => setShowDeliveryForm(true)}>
          Nhập Thông Tin Giao Hàng
        </Button>
      </div>

      {/* Modal for Delivery Info */}
      <Modal
        title="Thông Tin Giao Hàng"
        visible={showDeliveryForm}
        onCancel={() => setShowDeliveryForm(false)}
        footer={[
          <Button key="back" onClick={() => setShowDeliveryForm(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmitDeliveryInfo}
          >
            Lưu Thông Tin
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Địa chỉ</label>
            <Input
              placeholder="Nhập địa chỉ giao hàng"
              value={deliveryInfo.address}
              onChange={(e) =>
                setDeliveryInfo({ ...deliveryInfo, address: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Tên người nhận</label>
            <Input
              placeholder="Nhập tên người nhận"
              value={deliveryInfo.recipientName}
              onChange={(e) =>
                setDeliveryInfo({
                  ...deliveryInfo,
                  recipientName: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Số điện thoại</label>
            <Input
              placeholder="Nhập số điện thoại"
              value={deliveryInfo.phoneNumber}
              onChange={(e) =>
                setDeliveryInfo({
                  ...deliveryInfo,
                  phoneNumber: e.target.value,
                })
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Cart;
