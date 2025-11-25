import {
  ContactsOutlined,
  HomeOutlined,
  LogoutOutlined,
  OrderedListOutlined,
  ProductOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  HeartOutlined,
  MenuOutlined,
  CloseOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Image, Input, Menu, Drawer, Badge } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useDebounce from "../../hooks/useDebounce";
import { getAllProduct } from "../../service/productService";
import { formatCurrencyVND } from "../../utils";
import { IMAGEURL } from "../../utils/constant";
import logo from "../../assets/logo.png";
import { useWishlist } from "../../context/WishlistContext";

const Navbar = () => {
  const navigator = useNavigate();
  const [user, setUser] = useState(null);
  const [resultProduct, setResultProduct] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { wishlist } = useWishlist();
  const debouncedSearchText = useDebounce(searchText, 500);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem("cart");
      if (cart) {
        const cartItems = JSON.parse(cart);
        const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalCount);
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllProduct({
        page: 1,
        limit: 10,
        searchText: searchText,
      });
      if (res.status === 200) setResultProduct(res.data.data);
    };
    if (debouncedSearchText.trim()) {
      fetchData();
    } else {
      setResultProduct([]);
    }
  }, [debouncedSearchText]);

  const handleSearch = () => {
    if (searchText.trim()) {
      navigator(`/shop?search=${encodeURIComponent(searchText.trim())}`);
      setSearchText("");
      setMobileMenuOpen(false);
    }
  };

  const userMenu = (
    <Menu className="w-48">
      <Menu.Item onClick={() => navigator("/profile")}>
        <UserOutlined className="mr-2" />
        {user?.userName}
      </Menu.Item>
      <Menu.Item onClick={() => navigator("/history-order")}>
        <OrderedListOutlined className="mr-2" />
        Đơn hàng
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        onClick={() => {
          localStorage.removeItem("user");
          setUser(null);
          navigator("/login");
        }}
        className="text-red-500"
      >
        <LogoutOutlined className="mr-2" />
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  const navLinks = [
    { icon: <HomeOutlined />, text: "Trang chủ", path: "/" },
    { icon: <ProductOutlined />, text: "Sản phẩm", path: "/shop" },
    { icon: <ContactsOutlined />, text: "Liên hệ", path: "/contact" },
  ];

  return (
    <>
      {/* Top Bar - Vietnamese Style */}
      <div className="hidden md:block bg-gradient-to-r from-red-600 to-pink-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <PhoneOutlined />
                <span className="font-medium">Hotline: 1900-123-456</span>
              </div>
              <div className="flex items-center gap-2">
                <MailOutlined />
                <span>support@novafashion.vn</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="animate-pulse">🔥</span>
              <span className="font-bold">FREESHIP ĐƠN TỪ 300K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: 0 }}
        className={`bg-white border-b transition-all duration-300 ${isSticky ? "fixed top-0 left-0 right-0 z-50 shadow-lg" : ""
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
              <img src={logo} alt="NOVA FASHION" className="h-12 w-auto object-contain" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors font-medium"
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.text}</span>
                </Link>
              ))}
            </nav>

            {/* Search Bar - Modern Design */}
            <div className="hidden md:flex flex-1 max-w-2xl relative">
              <div className="relative w-full flex items-center gap-2">
                <Input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1 h-11 px-5 rounded-full border-2 border-gray-200 hover:border-red-400 focus:border-red-500 transition-all"
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  onPressEnter={handleSearch}
                />
                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 border-none shadow-md"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                />

                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {searchText.trim() && (
                    <>
                      <div
                        className="fixed inset-0 bg-black/20 z-40"
                        onClick={() => setSearchText("")}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-12 top-14 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto"
                      >
                        {resultProduct?.length > 0 ? (
                          <div className="p-2">
                            {resultProduct.map((item) => (
                              <div
                                key={item._id}
                                onClick={() => {
                                  setSearchText("");
                                  navigator(`/product-detail/${item._id}`);
                                }}
                                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                              >
                                <img
                                  src={IMAGEURL + item.img}
                                  alt={item.title}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 line-clamp-1">
                                    {item.title}
                                  </p>
                                  <p className="text-red-600 font-bold text-sm">
                                    {formatCurrencyVND(item.salePrice || item.price)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-gray-500">
                            <SearchOutlined className="text-4xl mb-2 opacity-50" />
                            <p>Không tìm thấy sản phẩm</p>
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              {/* Mobile Search Icon */}
              <Button
                type="text"
                icon={<SearchOutlined className="text-xl" />}
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden"
              />

              {user ? (
                <>
                  {/* Wishlist */}
                  <Badge count={wishlist.length} className="hidden sm:block">
                    <Button
                      type="text"
                      icon={<HeartOutlined className="text-xl text-red-500" />}
                      onClick={() => navigator("/wishlist")}
                    />
                  </Badge>

                  {/* Cart */}
                  <Badge count={cartCount}>
                    <Button
                      type="text"
                      icon={<ShoppingCartOutlined className="text-xl" />}
                      onClick={() => navigator("/cart")}
                    />
                  </Badge>

                  {/* User Avatar */}
                  <Dropdown overlay={userMenu} trigger={["click"]} placement="bottomRight">
                    <Avatar
                      size={40}
                      src={user?.avatar ? IMAGEURL + user.avatar : null}
                      icon={!user?.avatar && <UserOutlined />}
                      className="cursor-pointer bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white shadow-md hover:shadow-lg transition-shadow"
                    />
                  </Dropdown>
                </>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Button onClick={() => navigator("/login")} type="default">
                    Đăng nhập
                  </Button>
                  <Button onClick={() => navigator("/register")} type="primary" className="bg-gradient-to-r from-red-600 to-pink-600 border-none">
                    Đăng ký
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                type="text"
                icon={<MenuOutlined className="text-xl" />}
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <img src={logo} alt="NOVA FASHION" className="h-8" />
            {user && (
              <div className="flex items-center gap-2">
                <Avatar size={32} src={user?.avatar ? IMAGEURL + user.avatar : null} icon={<UserOutlined />} />
                <span className="text-sm font-medium">{user?.userName}</span>
              </div>
            )}
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
      >
        {/* Mobile Search */}
        <div className="mb-6">
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm kiếm..."
            onPressEnter={handleSearch}
            suffix={<SearchOutlined onClick={handleSearch} />}
            className="rounded-full"
          />
        </div>

        {/* Mobile Nav Links */}
        <div className="space-y-2">
          {navLinks.map((link, index) => (
            <div
              key={index}
              onClick={() => {
                navigator(link.path);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            >
              <span className="text-xl text-gray-600">{link.icon}</span>
              <span className="font-medium">{link.text}</span>
            </div>
          ))}

          {user && (
            <>
              <div className="my-4 border-t border-gray-200" />
              <div
                onClick={() => {
                  navigator("/wishlist");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <HeartOutlined className="text-xl text-red-500" />
                  <span className="font-medium">Yêu thích</span>
                </div>
                <Badge count={wishlist.length} />
              </div>
              <div
                onClick={() => {
                  navigator("/history-order");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <OrderedListOutlined className="text-xl text-gray-600" />
                <span className="font-medium">Đơn hàng</span>
              </div>
              <div
                onClick={() => {
                  navigator("/profile");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <UserOutlined className="text-xl text-gray-600" />
                <span className="font-medium">Tài khoản</span>
              </div>
              <div className="my-4 border-t border-gray-200" />
              <div
                onClick={() => {
                  localStorage.removeItem("user");
                  setUser(null);
                  navigator("/login");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg cursor-pointer text-red-600"
              >
                <LogoutOutlined className="text-xl" />
                <span className="font-medium">Đăng xuất</span>
              </div>
            </>
          )}

          {!user && (
            <>
              <div className="my-4 border-t border-gray-200" />
              <Button
                onClick={() => {
                  navigator("/login");
                  setMobileMenuOpen(false);
                }}
                block
                className="mb-2"
              >
                Đăng nhập
              </Button>
              <Button
                onClick={() => {
                  navigator("/register");
                  setMobileMenuOpen(false);
                }}
                type="primary"
                block
                className="bg-gradient-to-r from-red-600 to-pink-600 border-none"
              >
                Đăng ký
              </Button>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default Navbar;
