import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircleOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Image,
  InputNumber,
  message,
  Rate,
  Breadcrumb,
  Tabs,
  Avatar,
  Tooltip,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  getProductByType,
  getProductDetail,
} from "../../service/productService";
import { formatCurrencyVND } from "../../utils";
import ProductItem from "../../Components/ProductItem/ProductItem";
import { IMAGEURL } from "../../utils/constant";
import ImageMagnifier from "../../Components/ImageMagnifier/ImageMagnifier";
import QuickViewModal from "../../Components/QuickView/QuickView";
import { useWishlist } from "../../context/WishlistContext";
import FlashSaleBadge from "../../Components/FlashSaleBadge/FlashSaleBadge";

const { TabPane } = Tabs;

const ProductDetail = () => {
  const [productDetail, setProductDetail] = useState(null);
  const [productsRelated, setProductRelated] = useState([]);
  const { productId } = useParams();
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectQuantity, setSelectQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const { toggleWishlist: toggleWishlistAPI, isInWishlist } = useWishlist();

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProductDetail(productId);
        if (res.status === 200) {
          setProductDetail(res.data);
          // Auto select first available size
          const firstAvailableSize = res.data?.sizes?.find(
            (size) => size.quantity > 0
          )?.size;
          setSelectedSize(firstAvailableSize);
          setActiveImage(res.data.img);
        }
      } catch (error) {
        console.error("Error fetching product detail:", error);
        message.error("Không thể tải thông tin sản phẩm");
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [productId]);

  useEffect(() => {
    const fetchProductRelated = async () => {
      if (productDetail?.category?.name) {
        try {
          const res = await getProductByType(productDetail.category.name, 4);
          if (res.status === 200) {
            setProductRelated(res.data.filter(p => p._id !== productDetail._id));
          }
        } catch (error) {
          console.error("Error fetching related products:", error);
        }
      }
    };
    if (productDetail) {
      fetchProductRelated();
    }
  }, [productDetail]);

  const handleSizeClick = (size) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (type) => {
    if (type === "increase") {
      setSelectQuantity((prev) => prev + 1);
    } else if (type === "decrease" && selectQuantity > 1) {
      setSelectQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      message.warning("Vui lòng chọn size trước khi thêm vào giỏ hàng!");
      return;
    }

    const cart = localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
    const productIndex = cart.findIndex(
      (item) => item._id === productDetail._id && item.size === selectedSize
    );

    const itemPrice = productDetail.salePrice || productDetail.price;

    if (productIndex !== -1) {
      cart[productIndex].quantity += selectQuantity;
    } else {
      cart.push({
        _id: productDetail._id,
        title: productDetail.title,
        price: itemPrice, // Use sale price if available
        originalPrice: productDetail.price,
        img: productDetail.img,
        size: selectedSize,
        quantity: selectQuantity,
        discount: productDetail.discount || null,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    message.success("Đã thêm sản phẩm vào giỏ hàng!");
  };

  const toggleWishlist = () => {
    if (productDetail?._id) {
      toggleWishlistAPI(productDetail._id);
    }
  };

  if (!productDetail) return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4 mb-8">
        <div className="container mx-auto px-4">
          <Breadcrumb
            items={[
              { title: <a href="/">Trang chủ</a> },
              { title: <a href="/shop">Cửa hàng</a> },
              { title: productDetail.category?.name },
              { title: productDetail.title },
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column - Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Main Image Container - Fixed Aspect Ratio & Magnifier */}
            <div className="relative w-full bg-white rounded-2xl overflow-hidden group border border-gray-100 shadow-sm" style={{ aspectRatio: '3/4' }}>
              {imageError ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                  <div className="text-8xl mb-4">👕</div>
                  <p className="text-gray-400 text-lg font-medium">Hình ảnh không khả dụng</p>
                </div>
              ) : (
                <ImageMagnifier
                  src={IMAGEURL + activeImage}
                  alt={productDetail.title}
                  width="100%"
                  height="100%"
                  onError={() => setImageError(true)}
                />
              )}

              {productDetail.status === "out-of-stock" && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg z-10 pointer-events-none">
                  Hết hàng
                </div>
              )}
              <div className="absolute top-4 right-4 z-10">
                <Button
                  shape="circle"
                  icon={isInWishlist(productDetail?._id) ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                  size="large"
                  className="bg-white/80 backdrop-blur-sm border-none shadow-sm hover:scale-110 transition-transform"
                  onClick={toggleWishlist}
                />
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-4">
              {[productDetail.img].map((img, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activeImage === img ? "border-black" : "border-transparent hover:border-gray-300"
                    }`}
                  onClick={() => setActiveImage(img)}
                >
                  <img
                    src={IMAGEURL + img}
                    alt={`Thumbnail ${index}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            <div className="mb-2">
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                {productDetail.category?.name || "Fashion"}
              </span>
            </div>

            <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
              {productDetail.title}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-yellow-400">
                <Rate disabled defaultValue={productDetail.avgReview || 5} allowHalf className="text-yellow-400 text-sm" />
                <span className="text-gray-500 text-sm ml-2 font-medium">
                  ({productDetail.reviews?.length || 0} đánh giá)
                </span>
              </div>
              <div className="h-4 w-[1px] bg-gray-300"></div>
              <span className={`text-sm font-medium ${productDetail.status === "in-stock" ? "text-green-600" : "text-red-600"
                }`}>
                {productDetail.status === "in-stock" ? "Còn hàng" : "Hết hàng"}
              </span>
            </div>

            {/* Discount Banner (if applicable) */}
            {productDetail.discount && (
              <div className="mb-6">
                {/* Check if it's a flash sale (has endDate within 7 days) */}
                {productDetail.discount.endDate &&
                  (new Date(productDetail.discount.endDate) - new Date()) < (7 * 24 * 60 * 60 * 1000) &&
                  (new Date(productDetail.discount.endDate) - new Date()) > 0 ? (
                  <FlashSaleBadge discount={productDetail.discount} compact={false} />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🎉</span>
                        <h3 className="font-bold text-red-700 text-lg">
                          {productDetail.discount.name}
                        </h3>
                      </div>
                      <span className="bg-red-600 text-white px-4 py-1 rounded-full font-bold text-lg animate-pulse">
                        -{productDetail.discount.percentage}%
                      </span>
                    </div>
                    {productDetail.discount.description && (
                      <p className="text-sm text-gray-700 mb-2">
                        {productDetail.discount.description}
                      </p>
                    )}
                    {productDetail.discount.endDate && (
                      <p className="text-xs text-red-600 font-medium">
                        ⏰ Ưu đãi đến hết ngày: {new Date(productDetail.discount.endDate).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                    {productDetail.discount.terms && (
                      <p className="text-xs text-gray-500 italic mt-1">
                        {productDetail.discount.terms}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            <div className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              {productDetail.discount || productDetail.salePrice ? (
                <>
                  <span className="text-red-600">
                    {formatCurrencyVND(productDetail.salePrice || productDetail.price)}
                  </span>
                  <span className="text-lg text-gray-400 line-through font-normal">
                    {formatCurrencyVND(productDetail.price)}
                  </span>
                  {productDetail.discount && (
                    <span className="text-sm bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold">
                      Tiết kiệm {formatCurrencyVND(productDetail.price - productDetail.salePrice)}
                    </span>
                  )}
                </>
              ) : (
                formatCurrencyVND(productDetail.price)
              )}
            </div>

            <div className="space-y-8 mb-8">
              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-gray-900">Chọn kích cỡ</span>
                  <button className="text-sm text-gray-500 underline hover:text-black">
                    Hướng dẫn chọn size
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {productDetail.sizes?.map((size) => (
                    <Tooltip
                      key={size.size}
                      title={size.quantity === 0 ? "Hết hàng" : `Còn lại: ${size.quantity}`}
                    >
                      <button
                        disabled={size.quantity === 0}
                        onClick={() => size.quantity > 0 && handleSizeClick(size.size)}
                        className={`
                          w-14 h-14 rounded-lg font-bold text-lg transition-all duration-200 border-2
                          ${selectedSize === size.size
                            ? "border-black bg-black text-white shadow-lg transform scale-105"
                            : size.quantity === 0
                              ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed decoration-slice line-through"
                              : "border-gray-200 bg-white text-gray-900 hover:border-gray-400"
                          }
                        `}
                      >
                        {size.size}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-lg w-fit">
                  <button
                    onClick={() => handleQuantityChange("decrease")}
                    className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                    disabled={productDetail.status === "out-of-stock"}
                  >
                    <MinusOutlined />
                  </button>
                  <input
                    type="number"
                    value={selectQuantity}
                    readOnly
                    className="w-12 h-12 text-center border-none focus:ring-0 font-bold text-lg text-gray-900"
                  />
                  <button
                    onClick={() => handleQuantityChange("increase")}
                    className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                    disabled={productDetail.status === "out-of-stock"}
                  >
                    <PlusOutlined />
                  </button>
                </div>

                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingOutlined />}
                  onClick={handleAddToCart}
                  disabled={productDetail.status === "out-of-stock"}
                  className="flex-1 h-14 text-lg font-bold bg-black hover:bg-gray-800 border-none shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-lg"
                >
                  {productDetail.status === "out-of-stock" ? "Hết hàng" : "Thêm vào giỏ hàng"}
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="bg-white p-2 rounded-full shadow-sm text-green-600">
                  <CheckCircleOutlined />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Chính hãng 100%</h4>
                  <p className="text-xs text-gray-500">Cam kết chất lượng</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="bg-white p-2 rounded-full shadow-sm text-blue-600">
                  <ShareAltOutlined />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Đổi trả dễ dàng</h4>
                  <p className="text-xs text-gray-500">Trong vòng 30 ngày</p>
                </div>
              </div>
            </div>

            {/* Tabs: Description & Reviews */}
            <div className="mt-auto">
              <Tabs defaultActiveKey="1" className="modern-tabs">
                <TabPane tab="Mô tả sản phẩm" key="1">
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    <p>{productDetail.description || "Đang cập nhật mô tả..."}</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Chất liệu cao cấp, thoáng mát</li>
                      <li>Thiết kế hiện đại, trẻ trung</li>
                      <li>Đường may tinh tế, chắc chắn</li>
                      <li>Phù hợp đi chơi, đi làm, dạo phố</li>
                    </ul>
                  </div>
                </TabPane>
                <TabPane tab={`Đánh giá (${productDetail.reviews?.length || 0})`} key="2">
                  <div className="space-y-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {productDetail.reviews?.length > 0 ? (
                      productDetail.reviews.map((review) => (
                        <div key={review._id} className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={review.user?.avatar ? IMAGEURL + review.user.avatar : null}
                                icon={!review.user?.avatar && <UserOutlined />}
                                className="bg-gradient-to-r from-blue-400 to-purple-500"
                              />
                              <div>
                                <h4 className="font-bold text-sm text-gray-900">
                                  {review.user?.userName || review.user?.name || "Người dùng ẩn danh"}
                                </h4>
                                <Rate disabled defaultValue={review.rating} className="text-xs text-yellow-400" />
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm pl-11">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        Chưa có đánh giá nào. Hãy là người đầu tiên!
                      </div>
                    )}
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        <div className="mt-24 mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gray-900">Sản phẩm liên quan</h2>
            <a href="/shop" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
              Xem tất cả &rarr;
            </a>
          </div>

          {productsRelated.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {productsRelated.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductItem product={product} onQuickView={handleQuickView} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              Không có sản phẩm liên quan nào.
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => {
            setShowQuickView(false);
            setQuickViewProduct(null);
          }}
        />
      )}

      {/* Sticky Mobile CTA - Vietnamese E-commerce Style */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50 p-3 safe-area-bottom">
        <div className="flex gap-3">
          {/* Chat Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="min-w-[56px] min-h-[56px] flex items-center justify-center bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 transition-colors"
          >
            <span className="text-2xl">💬</span>
          </motion.button>

          {/* Add to Cart - Big and Bold */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={!selectedSize || productDetail?.status === "out-of-stock"}
            className="flex-1 min-h-[56px] bg-gradient-to-r from-red-600 to-pink-600 text-white font-black text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCartOutlined className="text-2xl" />
            <span>THÊM VÀO GIỎ HÀNG</span>
          </motion.button>
        </div>

        {/* Price summary on sticky bar */}
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-gray-600">Tổng tiền:</span>
          <span className="text-red-600 font-bold text-lg">
            {formatCurrencyVND((productDetail?.salePrice || productDetail?.price) * selectQuantity)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
