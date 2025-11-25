import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getAllCategory } from "../../service/categoryService";
import { IMAGEURL } from "../../utils/constant";

const FeaturedCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await getAllCategory({ page: 1, limit: 8 });
        if (res.status === 200) {
          // Get all active categories (max 4 for featured)
          const activeCategories = res.data.data.filter(
            (cat) => cat.status === "active"
          );
          setCategories(activeCategories.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fallback images for categories without images
  const getFallbackImage = (categoryName) => {
    const fallbackMap = {
      "Áo": "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=500&h=600&fit=crop",
      "Quần": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=600&fit=crop",
      "Phụ kiện": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&h=600&fit=crop",
      "Giày dép": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=600&fit=crop",
    };
    return fallbackMap[categoryName] || "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=600&fit=crop";
  };

  if (loading) {
    return (
      <div className="section-padding bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Danh mục nổi bật
            </h2>
            <p className="text-gray-600 text-lg">
              Khám phá các danh mục sản phẩm thời trang hot nhất
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null; // Don't show section if no categories with images
  }

  return (
    <div className="section-padding bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            ✨ Danh Mục Nổi Bật
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Khám phá các danh mục sản phẩm thời trang hot nhất được lựa chọn
            đặc biệt cho bạn
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Link
                to={`/shop?categories=${encodeURIComponent(category.name)}`}
                className="group block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Image Container */}
                <div className="aspect-[3/4] overflow-hidden bg-gray-200">
                  <img
                    src={
                      category.image
                        ? IMAGEURL + "/" + category.image
                        : getFallbackImage(category.name)
                    }
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                  <motion.div
                    initial={{ y: 10, opacity: 0.8 }}
                    whileHover={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-white text-xl md:text-2xl font-black mb-2 drop-shadow-lg">
                      {category.name}
                    </h3>
                    
                    {category.description && (
                      <p className="text-white/90 text-sm mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    <div className="inline-flex items-center gap-2 text-white font-semibold text-sm">
                      <span>Khám phá ngay</span>
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        →
                      </motion.span>
                    </div>
                  </motion.div>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        {categories.length >= 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-gray-900 font-bold text-lg hover:text-blue-600 transition-colors group"
            >
              <span>Xem tất cả danh mục</span>
              <span className="group-hover:translate-x-2 transition-transform">
                →
              </span>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FeaturedCategories;
