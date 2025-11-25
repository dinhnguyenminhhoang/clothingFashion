import React, { useState } from "react";
import { Modal, Button, Rate, InputNumber, message } from "antd";
import { motion } from "framer-motion";
import {
  CloseOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { formatCurrencyVND } from "../../utils";
import { IMAGEURL } from "../../utils/constant";
import { useNavigate } from "react-router-dom";

const QuickViewModal = ({ product, visible, onClose }) => {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes?.find((size) => size.quantity > 0)?.size
  );
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      message.warning("Vui lòng chọn size!");
      return;
    }

    const cart = localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];

    const productIndex = cart.findIndex(
      (item) => item._id === product._id && item.size === selectedSize
    );

    if (productIndex !== -1) {
      cart[productIndex].quantity += quantity;
    } else {
      cart.push({
        _id: product._id,
        title: product.title,
        price: product.price,
        img: product.img,
        size: selectedSize,
        quantity: quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    message.success("Đã thêm vào giỏ hàng!");
    onClose();
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      closeIcon={<CloseOutlined className="text-2xl" />}
      className="quick-view-modal"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square"
        >
          <img
            src={IMAGEURL + product.img}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {product.status === "out-of-stock" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                Hết hàng
              </span>
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Category */}
          <span className="inline-block text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {product.category?.name || "Thời trang"}
          </span>

          {/* Title */}
          <h2 className="text-3xl font-black text-gray-900">
            {product.title}
          </h2>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <Rate disabled defaultValue={product.avgReview || 5} allowHalf />
            <span className="text-sm text-gray-600">
              ({product.reviews?.length || 0} đánh giá)
            </span>
          </div>

          {/* Price */}
          <div className="py-4 border-y border-gray-200">
            <span className="text-4xl font-black text-gray-900">
              {formatCurrencyVND(product.price)}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">
            {product.description || "Sản phẩm chất lượng cao, phù hợp với mọi phong cách."}
          </p>

          {/* Size Selection */}
          {product.sizes?.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Kích Cỡ:
              </label>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size.size}
                    onClick={() =>
                      size.quantity > 0 && setSelectedSize(size.size)
                    }
                    disabled={size.quantity === 0}
                    className={`
                      px-4 py-2 font-bold rounded-lg transition-all
                      ${
                        selectedSize === size.size
                          ? "bg-black text-white scale-105"
                          : size.quantity === 0
                          ? "bg-gray-200 text-gray-400 line-through cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                    `}
                  >
                    {size.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Số Lượng:
            </label>
            <InputNumber
              min={1}
              value={quantity}
              onChange={(val) => setQuantity(val)}
              className="w-24"
              disabled={product.status === "out-of-stock"}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={handleAddToCart}
              disabled={product.status === "out-of-stock"}
              className="flex-1 bg-black hover:bg-gray-800 border-black h-12 font-bold"
            >
              Thêm Vào Giỏ
            </Button>
            <Button
              size="large"
              icon={<HeartOutlined />}
              className="h-12 px-6"
            />
          </div>

          {/* View Full Details */}
          <Button
            type="link"
            onClick={() => {
              navigate(`/product-detail/${product._id}`);
              onClose();
            }}
            className="w-full font-semibold"
          >
            Xem Chi Tiết Đầy Đủ →
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
};

export default QuickViewModal;
