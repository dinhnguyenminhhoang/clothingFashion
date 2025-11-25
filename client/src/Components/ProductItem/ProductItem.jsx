import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Rate, message } from "antd";
import {
  EyeOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { formatCurrencyVND } from "../../utils";
import { IMAGEURL } from "../../utils/constant";
import { useWishlist } from "../../context/WishlistContext";
import CountdownTimer from "../CountdownTimer/CountdownTimer";
import { TrustBadges, SoldCountBadge } from "../TrustBadge/TrustBadge";

const ProductItem = ({ product, onQuickView }) => {
  const navigator = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { _id, img, title, price, avgReview, reviews, status, sizes, discount, salePrice } =
    product || {};

  const [selectedSize, setSelectedSize] = useState(
    sizes?.find((size) => size.quantity > 0)?.size
  );
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSizeClick = (size) => {
    setSelectedSize(size);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedSize) {
      message.warning("Vui lòng chọn size trước khi thêm vào giỏ hàng!");
      return;
    }

    const cart = localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];

    const productIndex = cart.findIndex(
      (item) => item._id === _id && item.size === selectedSize
    );

    if (productIndex !== -1) {
      cart[productIndex].quantity += 1;
    } else {
      cart.push({
        _id,
        title,
        price: salePrice || price,
        originalPrice: price,
        img,
        size: selectedSize,
        quantity: 1,
        discount: discount || null,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));

    // Dispatch event to update cart count
    window.dispatchEvent(new Event("cartUpdated"));

    message.success("Đã thêm vào giỏ hàng!");
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(_id);
  };

  // Check if product is new (created within last 7 days)
  const isNew = product?.createdAt
    ? new Date() - new Date(product.createdAt) < 7 * 24 * 60 * 60 * 1000
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl md:rounded-2xl rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-200"
      style={{ willChange: "transform" }}
    >
      {/* Image Container */}
      <Link to={`/product-detail/${_id}`} className="block relative overflow-hidden">
        <div className="aspect-[3/4] bg-gray-100 relative">{imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
            <div className="text-6xl mb-2">👕</div>
            <p className="text-gray-400 text-sm font-medium">Hình ảnh không khả dụng</p>
          </div>
        ) : (
          <img
            src={IMAGEURL + img}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={handleImageError}
          />
        )}

          {/* Overlay Gradient - Hidden on mobile */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

          {/* Quick Actions Overlay - Desktop only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            className="hidden md:flex absolute inset-0 items-center justify-center gap-3"
          >
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onQuickView) {
                  onQuickView(product);
                } else {
                  navigator(`/product-detail/${_id}`);
                }
              }}
              icon={<EyeOutlined />}
              className="bg-white/90 backdrop-blur-sm border-none hover:bg-white hover:scale-110 transition-all"
              shape="circle"
              size="large"
              style={{ minWidth: '48px', minHeight: '48px' }}
            />
            <Button
              onClick={handleAddToCart}
              icon={<ShoppingCartOutlined />}
              className="bg-gradient-to-r from-red-600 to-pink-600 text-white border-none hover:scale-110 transition-all shadow-lg"
              shape="circle"
              size="large"
              disabled={status === "out-of-stock"}
              style={{ minWidth: '48px', minHeight: '48px' }}
            />
          </motion.div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 md:top-3 top-1 left-3 md:left-3 left-1 flex flex-col gap-2 md:gap-2 gap-1 z-10">
          {status === "out-of-stock" && (
            <span className="bg-red-500 text-white text-xs md:text-xs text-[10px] font-bold px-3 md:px-3 px-2 py-1 md:py-1 py-0.5 rounded-full">
              Hết hàng
            </span>
          )}
          {discount && status === "in-stock" && (
            <span className="bg-red-600 text-white text-xs md:text-xs text-[10px] font-bold px-3 md:px-3 px-2 py-1 md:py-1 py-0.5 rounded-full animate-pulse">
              -{typeof discount === 'object' ? discount.percentage : discount}%
            </span>
          )}
          {isNew && status === "in-stock" && !discount && (
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs md:text-xs text-[10px] font-bold px-3 md:px-3 px-2 py-1 md:py-1 py-0.5 rounded-full"
            >
              ✨ Mới
            </motion.span>
          )}
        </div>

        {/* Wishlist Button */}
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleWishlistToggle}
          className="absolute top-3 md:top-3 top-1 right-3 md:right-3 right-1 w-10 h-10 md:w-10 md:h-10 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          {isInWishlist(_id) ? (
            <HeartFilled className="text-red-500 text-xl md:text-xl text-base" />
          ) : (
            <HeartOutlined className="text-gray-700 text-xl md:text-xl text-base" />
          )}
        </motion.button>
      </Link>

      {/* Product Info */}
      <div className="p-4 md:p-4 p-2 space-y-3 md:space-y-3 space-y-1.5">{/* Sizes */}
        {sizes?.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {sizes.slice(0, 4).map((size) => (
              <button
                key={size.size}
                onClick={() => size.quantity > 0 && handleSizeClick(size.size)}
                disabled={size.quantity === 0}
                className={`
                  px-2.5 py-1 md:px-2.5 md:py-1 px-1.5 py-0.5 text-xs md:text-xs text-[10px] font-bold rounded-md transition-all
                  ${selectedSize === size.size
                    ? "bg-black text-white"
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
        )}

        {/* Title */}
        <Link to={`/product-detail/${_id}`}>
          <h3 className="font-bold text-gray-900 text-base md:text-base text-sm line-clamp-2 hover:text-blue-600 transition-colors">
            {title}
          </h3>
        </Link>

        {/* Rating & Reviews - Hidden on mobile for cleaner Shopee look */}
        <div className="hidden md:flex items-center gap-2">
          <Rate
            disabled
            defaultValue={avgReview || 5}
            allowHalf
            className="text-base"
            style={{ fontSize: 16, color: '#FFD60A' }}
          />
          <span className="text-sm text-gray-700 font-medium">
            {avgReview ? avgReview.toFixed(1) : '5.0'}
          </span>
          <span className="text-xs text-gray-500">({reviews?.length || 0})</span>
        </div>

        {/* Price */}
        {/* Price */}
        <div className="flex items-center justify-between">
          {(discount || salePrice) && (salePrice < price) ? (
            <div className="flex flex-col">
              <span className="text-xl md:text-xl text-base font-black text-red-600">
                {formatCurrencyVND(salePrice)}
              </span>
              <span className="text-xs md:text-xs text-[10px] text-gray-400 line-through">
                {formatCurrencyVND(price)}
              </span>
            </div>
          ) : (
            <span className="text-xl md:text-xl text-base font-black text-gray-900">
              {formatCurrencyVND(price)}
            </span>
          )}
        </div>

        {/* Flash Sale Countdown - Smaller on mobile */}
        {discount && typeof discount === 'object' && discount.endDate &&
          (new Date(discount.endDate) - new Date()) < (7 * 24 * 60 * 60 * 1000) &&
          (new Date(discount.endDate) - new Date()) > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 md:gap-1.5 gap-1 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300 rounded-lg px-2 md:px-2 px-1.5 py-1 md:py-1 py-0.5">
              <span className="text-orange-600 text-xs md:text-xs text-[10px]">⚡</span>
              <span className="text-orange-700 font-bold text-xs md:text-xs text-[10px]">Flash Sale:</span>
              <CountdownTimer endDate={discount.endDate} compact={true} />
            </div>
          )}

        {/* Trust Badges - Simplified for mobile */}
        <div className="mt-2 space-y-2 md:space-y-2 space-y-1 hidden md:block">
          {/* Sold Count - Very important in VN market! */}
          {product.sold && (
            <SoldCountBadge count={product.sold} />
          )}

          {/* Trust Badges Row */}
          <TrustBadges
            badges={[
              ...(status === "in-stock" ? [{ type: 'freeship', text: 'Freeship' }] : []),
              { type: 'authentic', text: 'Chính hãng' },
              ...(discount ? [{ type: 'hot', text: 'Hot' }] : []),
            ]}
          />
        </div>

        {/* Mobile-only: Sold count in compact format */}
        <div className="block md:hidden">
          {product.sold && (
            <span className="text-[10px] text-gray-500">Đã bán {product.sold}</span>
          )}
        </div>
      </div>

      {/* Bottom Glow Effect - Desktop only */}
      <div className="hidden md:block absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </motion.div>
  );
};

export default ProductItem;
