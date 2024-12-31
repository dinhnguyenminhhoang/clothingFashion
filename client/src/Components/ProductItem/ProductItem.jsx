import { EyeOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Rate } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatCurrencyVND } from "../../utils";

const ProductItem = ({ product }) => {
  const navigator = useNavigate();
  const { img, title, price, avgReview, sellCount, status, sizes } =
    product || {};

  const [selectedSize, setSelectedSize] = useState(sizes?.[0]);
  const handleSizeClick = (size) => {
    setSelectedSize(size);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="relative group">
        <Link to={`/product-detail/${product?._id}`} className="block">
          <img
            src={img}
            alt="product img"
            width={284}
            height={302}
            className="w-full h-auto object-cover"
          />
        </Link>
        {status === "out-of-stock" && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-sm px-3 py-1 rounded">
            Out of Stock
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50">
          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => navigator(`/product-detail/${product?._id}`)}
              icon={<EyeOutlined className="text-2xl" />}
              className="py-5 px-4 bg-white text-black rounded-full hover:bg-gray-200"
            >
              Xem chi tiết
            </Button>
            <Button
              icon={<ShoppingCartOutlined className="text-2xl" />}
              className="py-5 px-4 bg-white text-black rounded-full hover:bg-gray-200"
            >
              Thêm vào giỏ
            </Button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          {sizes?.length
            ? sizes?.map((size) => (
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
          <Link to={`/product-detail/${product?._id}`}>{title}</Link>
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
            <span>({sellCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
