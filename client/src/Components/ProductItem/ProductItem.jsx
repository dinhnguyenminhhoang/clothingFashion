import { EyeOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Rate, message } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatCurrencyVND } from "../../utils";
import { IMAGEURL } from "../../utils/constant";

const ProductItem = ({ product }) => {
  const navigator = useNavigate();
  const { _id, img, title, price, avgReview, reviews, status, sizes } =
    product || {};

  const [selectedSize, setSelectedSize] = useState(sizes?.[0]);

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
        _id,
        title,
        price,
        img,
        size: selectedSize,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    message.success("Sản phẩm đã được thêm vào giỏ hàng!");
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="relative group">
        <Link to={`/product-detail/${_id}`} className="block">
          <img
            src={IMAGEURL + img}
            alt="product img"
            width={284}
            height={302}
            className="w-full h-auto object-cover"
          />
        </Link>
        {status === "out-of-stock" && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-sm px-3 py-1 rounded">
            Hết hàng
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50">
          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => navigator(`/product-detail/${_id}`)}
              icon={<EyeOutlined className="text-2xl" />}
              className="py-5 px-4 bg-white text-black rounded-full hover:bg-gray-200"
            >
              Xem chi tiết
            </Button>
            <Button
              onClick={handleAddToCart}
              icon={<ShoppingCartOutlined className="text-2xl" />}
              className="py-5 px-4 bg-white text-black rounded-full hover:bg-gray-200"
              disabled={status === "out-of-stock"}
            >
              Thêm vào giỏ
            </Button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          {sizes?.length
            ? sizes.map((size) => (
                <Button
                  key={size}
                  className={`font-bold ${
                    selectedSize === size ? "bg-blue-500 text-white" : ""
                  }`}
                  onClick={() => handleSizeClick(size)}
                >
                  {size}
                </Button>
              ))
            : null}
        </div>
        <h3 className="text-lg font-medium text-gray-800 mt-2">
          <Link to={`/product-detail/${_id}`}>{title}</Link>
        </h3>
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-lg font-semibold text-gray-800">
            {formatCurrencyVND(price)}
          </span>
          <div className="flex items-center gap-4">
            <Rate
              disabled
              defaultValue={avgReview}
              allowHalf
              className="text-yellow-500"
            />
            <span>({reviews?.length})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
