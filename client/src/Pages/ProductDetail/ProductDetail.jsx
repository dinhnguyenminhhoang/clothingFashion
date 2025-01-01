import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, Divider, Image, InputNumber, message, Rate } from "antd";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import payment_option_img from "../../assets/img/payment-option.png";
import {
  getProductByType,
  getProductDetail,
} from "../../service/productService";
import { formatCurrencyVND } from "../../utils";
import ProductItem from "../../Components/ProductItem/ProductItem";

const ProductDetail = () => {
  const [productDetail, setProductDetail] = useState();
  const [productsRelated, setProductRelated] = useState();
  const { productId } = useParams();
  const [selectedSize, setSelectedSize] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const res = await getProductDetail(productId);
      if (res.status === 200) {
        setProductDetail(res.data);
        setSelectedSize(res.data?.sizes?.[0]);
      }
    };

    fetchData();
  }, [productId]);
  useEffect(() => {
    const fetchProductRelated = async () => {
      const res = await getProductByType(productDetail.productType, 4);
      if (res.status === 200) {
        setProductRelated(res.data);
      }
    };
    if (productDetail) {
      fetchProductRelated();
    }
  }, [productDetail]);
  const handleSizeClick = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      message.warning("Vui lòng chọn size trước khi thêm vào giỏ hàng!");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
    const productIndex = cart.findIndex(
      (item) => item._id === _id && item.size === selectedSize
    );

    if (productIndex !== -1) {
      cart[productIndex].quantity += 1;
    } else {
      cart.push({
        _id: productDetail._id,
        title: productDetail.title,
        price: productDetail.price,
        img: productDetail.img,
        size: selectedSize,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    message.success("Sản phẩm đã được thêm vào giỏ hàng!");
  };
  return productDetail ? (
    <div className="flex justify-center mt-10">
      <div className="p-4 max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="relative bg-[#F5F6F8] rounded-md">
            <Image
              src={
                productDetail?.img ||
                "https://via.placeholder.com/416x480?text=No+Image"
              }
              alt="product img"
              className="w-full h-auto object-cover rounded"
            />
            {productDetail?.status === "out-of-stock" && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded">
                Out of Stock
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-400 uppercase">
              {productDetail?.productType}
            </h3>
            <h3 className="text-3xl font-semibold text-gray-800 mb-4">
              {productDetail?.title || "Product Title"}
            </h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Rate
                  disabled
                  defaultValue={productDetail?.avgReview || 5}
                  allowHalf
                />
                <span className="text-gray-600 text-sm">
                  ({productDetail?.reviews?.length || 0} Review
                  {productDetail?.reviews?.length === 1 ? "" : "s"})
                </span>
              </div>
              <span
                className={`px-4 py-1 rounded-full text-sm ${
                  productDetail?.status === "in-stock"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {productDetail?.status === "in-stock" ? "Còn hàng" : "Hết hàng"}
              </span>
            </div>

            <p className="text-gray-700 mb-6">
              {productDetail?.description || "No description available."}
            </p>

            <div className="mb-6">
              <span className="text-xl font-bold text-gray-800">
                {formatCurrencyVND(productDetail?.price) || "0.00"}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium">Số lượng:</span>
                  <InputNumber
                    min={1}
                    defaultValue={1}
                    className="w-20"
                    disabled={productDetail?.status === "out-of-stock"}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">Kích cỡ:</span>
                  {productDetail?.sizes?.length
                    ? productDetail?.sizes?.map((size) => (
                        <Button
                          key={size}
                          className={`font-bold ${
                            selectedSize === size
                              ? "bg-blue-500 text-white"
                              : ""
                          }`}
                          onClick={() => handleSizeClick(size)}
                        >
                          {size}
                        </Button>
                      ))
                    : null}
                </div>
              </div>
              <Button
                type="primary"
                block
                size="large"
                disabled={productDetail?.status === "out-of-stock"}
                className="bg-blue-500 hover:bg-blue-600"
                onClick={handleAddToCart}
              >
                Thêm vào giỏ hàng
              </Button>
              <div className="my-4">
                <div className="flex items-center gap-4">
                  <CheckCircleOutlined className="text-green-600" />
                  <span>30 ngày trả hàng dễ dàng</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <CheckCircleOutlined className="text-green-600" />
                  <span>
                    Đặt hàng trước 2:30 chiều để được giao hàng trong ngày
                  </span>
                </div>
                <div className="flex bg-[#F5F6F8] mt-4 px-6 py-4 justify-between">
                  <p>
                    Đảm bảo an toàn <br /> & thanh toán bảo mật
                  </p>
                  <img src={payment_option_img} alt="payment_option_img" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Divider className="mt-8" />
        <div>
          <h4 className="text-2xl font-semibold mb-4">Đánh giá sản phẩm</h4>
          {productDetail?.reviews?.length > 0 ? (
            productDetail.reviews.map((review) => (
              <div
                key={review._id}
                className="border-b pb-4 mb-4 border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <Rate disabled defaultValue={review.rating} allowHalf />
                  <span className="text-sm text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mt-2">{review.comment}</p>
              </div>
            ))
          ) : (
            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
          )}
        </div>
        <div>
          <h4 className="text-2xl font-semibold mb-4">Sản phẩm liên quan</h4>
          <div className="flex justify-center items-center">
            <div className="container">
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productsRelated?.map((product) => (
                  <ProductItem key={product._id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default ProductDetail;
