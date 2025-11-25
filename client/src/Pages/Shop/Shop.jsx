import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Button, Pagination, Select, message, Drawer, Tag } from "antd";
import { formatCurrencyVND } from "../../utils";
import { getAllProduct } from "../../service/productService";
import ProductItem from "../../Components/ProductItem/ProductItem";
import { getAllCategory } from "../../service/categoryService";
import QuickViewModal from "../../Components/QuickView/QuickView";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);

  const [pagi, setPagi] = useState({
    total: 1,
    limit: 12,
    page: 1,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    priceRange: [0, 5000000],
    status: [],
    category: [],
    brand: [],
    rating: null,
    hasDiscount: false,
    sortBy: null,
    searchText: "",
  });

  // Debounced price range for performance
  const [debouncedPriceRange, setDebouncedPriceRange] = useState([0, 5000000]);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchText = searchParams.get("search");
  const categoryText = searchParams.get("categories");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getAllProduct({
        page: pagi.page,
        limit: pagi.limit,
        filters,
      });
      if (res.status === 200) {
        console.log('Products response:', res.data); // DEBUG
        console.log('First product:', res.data.data[0]); // DEBUG
        setProducts(res.data.data);
        setPagi(res.data.meta);
      }
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCategories = async () => {
    try {
      const res = await getAllCategory({ page: 1, limit: 100 });
      if (res.status === 200) {
        setCategories(res.data.data.filter(cat => cat.status === "active"));
      }
    } catch (error) {
      message.error("Không thể tải danh mục");
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  useEffect(() => {
    if (searchText) {
      setFilters((prev) => ({ ...prev, searchText }));
    } else {
      setFilters((prev) => ({ ...prev, searchText: "" }));
    }
  }, [searchText]);

  useEffect(() => {
    if (categoryText && categories.length > 0) {
      const matchedCategory = categories.find((cate) =>
        new RegExp(`^${categoryText}$`, "i").test(cate.name)
      );
      if (matchedCategory) {
        setFilters((prev) => ({ ...prev, category: [matchedCategory._id] }));
      }
    }
  }, [categoryText, categories]);

  useEffect(() => {
    fetchProducts();
  }, [filters, pagi.page, pagi.limit]);

  // Debounce price range to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, priceRange: debouncedPriceRange }));
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [debouncedPriceRange]);

  const handlePriceRangeChange = (values) => {
    setDebouncedPriceRange(values);
  };

  const handleStockChange = (stockStatus) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(stockStatus)
        ? prev.status.filter((status) => status !== stockStatus)
        : [...prev.status, stockStatus],
    }));
  };

  const handleCategoryChange = (category) => {
    setFilters((prev) => ({
      ...prev,
      category: prev?.category?.includes(category)
        ? prev?.category.filter((cat) => cat !== category)
        : [...prev.category, category],
    }));
  };

  const handleSortChange = (value) => {
    setFilters({ ...filters, sortBy: value });
  };

  const handlePageChange = (page, pageSize) => {
    setPagi((prev) => ({ ...prev, page, limit: pageSize }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 5000000],
      status: [],
      category: [],
      brand: [],
      rating: null,
      hasDiscount: false,
      sortBy: null,
      searchText: filters.searchText, // Keep search text
    });
    setDebouncedPriceRange([0, 5000000]);
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };

  const activeFiltersCount =
    filters.status.length +
    filters.category.length +
    filters.brand.length +
    (filters.rating ? 1 : 0) +
    (filters.hasDiscount ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000000 ? 1 : 0);

  // Filter Sidebar Component
  const FilterSidebar = ({ isMobile = false }) => (
    <div className={`space-y-6 ${isMobile ? "p-4" : ""}`}>
      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm">Bộ lọc đang áp dụng</span>
            <Button
              type="link"
              size="small"
              onClick={clearFilters}
              className="text-red-500"
            >
              Xóa tất cả
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.category.map((catId) => {
              const cat = categories.find((c) => c._id === catId);
              return (
                <Tag
                  key={catId}
                  closable
                  onClose={() => handleCategoryChange(catId)}
                >
                  {cat?.name}
                </Tag>
              );
            })}
            {filters.status.map((status) => (
              <Tag
                key={status}
                closable
                onClose={() => handleStockChange(status)}
              >
                {status === "in-stock" ? "Còn hàng" : "Hết hàng"}
              </Tag>
            ))}
          </div>
        </motion.div>
      )}

      {/* Price Range - Input Numbers instead of Slider */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          💰 Khoảng giá
        </h3>
        <div className="space-y-3">
          {/* Min Price */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Giá tối thiểu</label>
            <input
              type="number"
              value={debouncedPriceRange[0]}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setDebouncedPriceRange([value, debouncedPriceRange[1]]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0 ₫"
              min={0}
              max={debouncedPriceRange[1]}
              step={100000}
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Giá tối đa</label>
            <input
              type="number"
              value={debouncedPriceRange[1]}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 5000000;
                setDebouncedPriceRange([debouncedPriceRange[0], value]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="5,000,000 ₫"
              min={debouncedPriceRange[0]}
              step={100000}
            />
          </div>

          {/* Price Display */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Từ:</span>
              <span className="font-bold text-gray-900">{formatCurrencyVND(debouncedPriceRange[0])}</span>
            </div>
            <div className="flex justify-between items-center text-xs mt-1">
              <span className="text-gray-600">Đến:</span>
              <span className="font-bold text-gray-900">{formatCurrencyVND(debouncedPriceRange[1])}</span>
            </div>
          </div>

          {/* Quick Price Buttons - Vietnamese Style */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDebouncedPriceRange([0, 500000])}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
            >
              &lt; 500K
            </button>
            <button
              onClick={() => setDebouncedPriceRange([500000, 1000000])}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
            >
              500K - 1M
            </button>
            <button
              onClick={() => setDebouncedPriceRange([1000000, 2000000])}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
            >
              1M - 2M
            </button>
            <button
              onClick={() => setDebouncedPriceRange([2000000, 5000000])}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
            >
              &gt; 2M
            </button>
          </div>
        </div>
      </div>

      {/* Stock Status */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          📦 Tình trạng
        </h3>
        <div className="space-y-3">
          {[
            { value: "in-stock", label: "Còn hàng" },
            { value: "out-of-stock", label: "Hết hàng" },
          ].map((status) => (
            <label
              key={status.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.status.includes(status.value)}
                onChange={() => handleStockChange(status.value)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                {status.label}
              </span>
            </label>
          ))}
        </div>
      </div>
      {/* Rating Filter - Vietnamese Style */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          ⭐ Đánh giá
        </h3>
        <div className="space-y-2">
          {[5, 4, 3].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-2 cursor-pointer group hover:bg-yellow-50 p-2 rounded transition-colors"
            >
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => setFilters((prev) => ({ ...prev, rating }))}
                className="w-4 h-4 text-yellow-500"
              />
              <div className="flex items-center gap-1">
                {[...Array(rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">⭐</span>
                ))}
                {[...Array(5 - rating)].map((_, i) => (
                  <span key={i} className="text-gray-300 text-sm">⭐</span>
                ))}
                <span className="text-sm text-gray-600 ml-1">trở lên</span>
              </div>
            </label>
          ))}
          {filters.rating && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, rating: null }))}
              className="text-red-500 text-sm hover:underline"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Discount Filter */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          🔥 Khuyến mãi
        </h3>
        <label className="flex items-center gap-3 cursor-pointer group hover:bg-red-50 p-2 rounded transition-colors">
          <input
            type="checkbox"
            checked={filters.hasDiscount}
            onChange={(e) => setFilters((prev) => ({ ...prev, hasDiscount: e.target.checked }))}
            className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
          />
          <div className="flex items-center gap-2">
            <span className="text-gray-700 group-hover:text-gray-900 font-medium">
              Chỉ hiển thị sản phẩm giảm giá
            </span>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              HOT
            </span>
          </div>
        </label>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          🏷️ Danh mục
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {categories.map((category) => (
            <label
              key={category._id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.category.includes(category._id)}
                onChange={() => handleCategoryChange(category._id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            {searchText ? `Kết quả cho "${searchText}"` : "Cửa hàng"}
          </h1>
          <p className="text-gray-600">
            Khám phá {pagi.total} sản phẩm thời trang chất lượng
          </p>
        </motion.div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden"
                >
                  Bộ lọc {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Button>

                <span className="text-gray-600 font-medium">
                  {products.length} sản phẩm
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${viewMode === "grid"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-600"
                      }`}
                  >
                    <AppstoreOutlined />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${viewMode === "list"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-600"
                      }`}
                  >
                    <UnorderedListOutlined />
                  </button>
                </div>

                {/* Sort */}
                <Select
                  className="w-48"
                  placeholder="Sắp xếp"
                  onChange={handleSortChange}
                  value={filters.sortBy}
                >
                  <Select.Option value={null}>Mặc định</Select.Option>
                  <Select.Option value="price-asc">Giá tăng dần</Select.Option>
                  <Select.Option value="price-desc">Giá giảm dần</Select.Option>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[3/4] bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`grid gap-6 ${viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                    }`}
                >
                  {products.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductItem product={product} onQuickView={handleQuickView} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-600 mb-6">
                  Thử điều chỉnh bộ lọc hoặc tìm kiếm khác
                </p>
                <Button type="primary" onClick={clearFilters}>
                  Xóa bộ lọc
                </Button>
              </div>
            )}

            {/* Pagination */}
            {products.length > 0 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  current={pagi.page}
                  pageSize={pagi.limit}
                  total={pagi.total}
                  onChange={handlePageChange}
                  showSizeChanger
                  pageSizeOptions={[12, 24, 48]}
                  className="modern-pagination"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <Drawer
        title="Bộ lọc"
        placement="left"
        onClose={() => setMobileFiltersOpen(false)}
        open={mobileFiltersOpen}
        width={320}
      >
        <FilterSidebar isMobile />
      </Drawer>

      <QuickViewModal
        product={quickViewProduct}
        visible={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </div>
  );
};

export default Shop;
