import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { getAllCategory } from "../../service/categoryService";
import { IMAGEURL } from "../../utils/constant";
import { motion } from "framer-motion";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Gradient backgrounds for categories (modern & vibrant)
const categoryGradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Purple
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", // Pink-Red
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", // Blue
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", // Green-Cyan
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", // Pink-Yellow
  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", // Cyan-Purple
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", // Pastel
  "linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)", // Orange-Pink
];

// Main Component
const ProductArea = () => {
  const navigator = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await getAllCategory({ page: 1, limit: 20 });
        if (res.status === 200) {
          // Filter only active categories
          const activeCategories = res.data.data.filter(
            (cat) => cat.status === "active"
          );
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" tip="Đang tải danh mục..." />
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="py-12 md:py-16 px-4 md:px-10 bg-gradient-to-b from-gray-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
          🛍️ Khám Phá Danh Mục
        </h2>
        <p className="text-gray-600 text-base md:text-lg">
          Tìm kiếm phong cách hoàn hảo cho bạn
        </p>
      </motion.div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
          1280: {
            slidesPerView: 4,
            spaceBetween: 28,
          },
        }}
        className="category-slider !pb-12"
      >
        {categories.map((category, index) => {
          const hasImage = category.image && category.image.trim() !== "";

          return (
            <SwiperSlide key={category._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-[380px]"
                onClick={() => navigator(`/shop?categories=${encodeURIComponent(category.name)}`)}
              >
                {/* Image or Gradient Background */}
                {hasImage ? (
                  <>
                    <div className="absolute inset-0">
                      <img
                        src={IMAGEURL + "/" + category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    </div>
                    {/* Dark Gradient Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </>
                ) : (
                  /* Gradient Background if no image */
                  <div
                    className="absolute inset-0"
                    style={{ background: categoryGradients[index % categoryGradients.length] }}
                  />
                )}

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <motion.div
                    initial={{ y: 10 }}
                    whileHover={{ y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-white text-2xl md:text-3xl font-black mb-3 drop-shadow-lg">
                      {category.name}
                    </h3>

                    {/* Only show description if it exists and is different from category name */}
                    {category.description &&
                      category.description.toLowerCase() !== category.name.toLowerCase() && (
                        <p className="text-white/90 text-sm mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      )}

                    <Button
                      icon={<ArrowRightOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator(`/shop?categories=${encodeURIComponent(category.name)}`);
                      }}
                      className="bg-white text-gray-900 border-0 font-bold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                      size="large"
                    >
                      Khám phá ngay
                    </Button>
                  </motion.div>
                </div>

                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000" />
              </motion.div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom Swiper Navigation Styles */}
      <style jsx>{`
        .category-slider .swiper-button-prev,
        .category-slider .swiper-button-next {
          background: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .category-slider .swiper-button-prev:after,
        .category-slider .swiper-button-next:after {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
        }

        .category-slider .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #9ca3af;
        }

        .category-slider .swiper-pagination-bullet-active {
          background: #1f2937;
          width: 24px;
          border-radius: 5px;
        }

        @media (max-width: 768px) {
          .category-slider .swiper-button-prev,
          .category-slider .swiper-button-next {
            width: 36px;
            height: 36px;
          }

          .category-slider .swiper-button-prev:after,
          .category-slider .swiper-button-next:after {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductArea;
