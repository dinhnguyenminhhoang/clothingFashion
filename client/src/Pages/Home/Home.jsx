import React, { useEffect, useState } from "react";
import HomeHeroSlider from "../../Components/HomeHeroSlider/HomeHeroSlider";
import ProductArea from "../../Components/ProductArea/ProductArea";
import TitleResuable from "../../Components/TitleResuable/TitleResuable";
import FeaturedCategories from "../../Components/FeaturedCategories/FeaturedCategories";
import Statistics from "../../Components/Statistics/Statistics";
import Testimonials from "../../Components/Testimonials/Testimonials";
import Newsletter from "../../Components/Newsletter/Newsletter";
import { getHomepageData } from "../../service/productService";
import ProductItem from "../../Components/ProductItem/ProductItem";
import { Spin } from "antd";
import QuickViewModal from "../../Components/QuickView/QuickView";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [homepageData, setHomepageData] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setLoading(true);
        const res = await getHomepageData();
        if (res.status === 200) {
          setHomepageData(res.data);
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomepageData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <>
      <HomeHeroSlider />

      <FeaturedCategories />

      <ProductArea />

      {/* New Arrivals - Sản phẩm mới */}
      {homepageData?.newArrivals?.length > 0 && (
        <section className="section-padding bg-white">
          <TitleResuable
            title="✨ Sản phẩm mới"
            description="Những sản phẩm vừa ra mắt tại cửa hàng"
          />
          <div className="flex justify-center items-center">
            <div className="container">
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
                {homepageData.newArrivals.map((product) => (
                  <ProductItem key={product._id} product={product} onQuickView={handleQuickView} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <Statistics />

      {/* Best Sellers - Bán chạy nhất */}
      {homepageData?.bestSellers?.length > 0 && (
        <section className="section-padding bg-gray-50">
          <TitleResuable
            title="🔥 Bán chạy nhất"
            description="Những sản phẩm được khách hàng yêu thích nhất"
          />
          <div className="flex justify-center items-center">
            <div className="container">
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
                {homepageData.bestSellers.map((product) => (
                  <ProductItem key={product._id} product={product} onQuickView={handleQuickView} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Top Rated - Đánh giá cao */}
      {homepageData?.topRated?.length > 0 && (
        <section className="section-padding bg-white">
          <TitleResuable
            title="⭐ Đánh giá cao"
            description="Sản phẩm được đánh giá tốt nhất"
          />
          <div className="flex justify-center items-center">
            <div className="container">
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
                {homepageData.topRated.map((product) => (
                  <ProductItem key={product._id} product={product} onQuickView={handleQuickView} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <Testimonials />

      {/* Products by Category - Sản phẩm theo danh mục */}
      {homepageData?.productsByCategory?.map((categoryData, index) => (
        <section
          key={categoryData.category._id}
          className={`section-padding ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
        >
          <TitleResuable
            title={categoryData.category.name}
            description={`Khám phá các sản phẩm ${categoryData.category.name.toLowerCase()}`}
          />
          <div className="flex justify-center items-center">
            <div className="container">
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
                {categoryData.products.map((product) => (
                  <ProductItem key={product._id} product={product} onQuickView={handleQuickView} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Featured Products - Nổi bật */}
      {homepageData?.featuredProducts?.length > 0 && (
        <section className="section-padding bg-white">
          <TitleResuable
            title="💎 Sản phẩm nổi bật"
            description="Được đề xuất đặc biệt cho bạn"
          />
          <div className="flex justify-center items-center">
            <div className="container">
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
                {homepageData.featuredProducts.map((product) => (
                  <ProductItem key={product._id} product={product} onQuickView={handleQuickView} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <Newsletter />

      <QuickViewModal
        product={quickViewProduct}
        visible={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};

export default Home;
