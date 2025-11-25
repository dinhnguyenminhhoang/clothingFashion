import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbNameMap = {
    shop: "Sản phẩm",
    cart: "Giỏ hàng",
    profile: "Tài khoản",
    contact: "Liên hệ",
    "history-order": "Lịch sử đơn hàng",
    "product-detail": "Chi tiết sản phẩm",
  };

  if (pathnames.length === 0) return null;

  return (
    <div className="bg-gray-50 py-4 border-b">
      <div className="container">
        <nav className="flex items-center space-x-2 text-sm">
          <Link
            to="/"
            className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <HomeOutlined />
            <span>Trang chủ</span>
          </Link>
          {pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            const name = breadcrumbNameMap[value] || value;

            return (
              <React.Fragment key={to}>
                <span className="text-gray-400">/</span>
                {isLast ? (
                  <span className="text-gray-900 font-medium">{name}</span>
                ) : (
                  <Link
                    to={to}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {name}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumbs;
