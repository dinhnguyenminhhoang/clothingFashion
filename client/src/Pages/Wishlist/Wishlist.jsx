import React, { useEffect } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import ProductItem from '../../Components/ProductItem/ProductItem';
import { Empty, Spin, Button } from 'antd';
import { HeartOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const { wishlist, loading, fetchWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Đang tải danh sách yêu thích..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <HeartOutlined className="text-red-500" />
              Danh sách yêu thích
            </h1>
            <p className="text-gray-600 mt-2">
              {wishlist.length} sản phẩm
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={() => navigate('/shop')}
          >
            Tiếp tục mua sắm
          </Button>
        </div>

        {/* Content */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-16">
            <Empty
              description={
                <div className="text-center">
                  <HeartOutlined className="text-6xl text-gray-300 mb-4" />
                  <p className="text-xl text-gray-600 mb-2">
                    Chưa có sản phẩm yêu thích nào
                  </p>
                  <p className="text-gray-500 mb-6">
                    Hãy thêm sản phẩm yêu thích để dễ dàng theo dõi và mua sắm sau
                  </p>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => navigate('/shop')}
                  >
                    Khám phá sản phẩm
                  </Button>
                </div>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map(product => (
              <ProductItem key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
