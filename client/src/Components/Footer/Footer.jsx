import {
  FacebookOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import pay from "../../assets/img/footer/footer-pay.png";
import logo from "../../assets/logo.png";
import { Email, Location } from "../../svg/index";

const social_data = [
  {
    id: 1,
    link: "https://www.facebook.com/hamed.y.hasan0",
    icon: <FacebookOutlined />,
    title: "Facebook",
  },
  {
    id: 2,
    link: "https://twitter.com/HamedHasan75",
    icon: <TwitterOutlined />,
    title: "Twitter",
  },
  {
    id: 3,
    link: "https://linkedin.com/in/hamed-hasan/",
    icon: <LinkedinOutlined />,
    title: "LinkedIn",
  },
  {
    id: 4,
    link: "https://vimeo.com/",
    icon: <VideoCameraOutlined />,
    title: "Vimeo",
  },
];
const Footer = () => {
  return (
    <footer className="mt-20 bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div>
            <Link to="/" className="inline-block mb-6">
              <img src={logo} alt="NOVA FASHION" className="h-12 w-auto brightness-0 invert" />
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6">
              Chúng tôi là đội ngũ chuyên nghiệp cam kết mang đến những sản phẩm thời trang chất lượng cao,
              phong cách hiện đại và trải nghiệm mua sắm tuyệt vời nhất.
            </p>
            <div className="flex space-x-4">
              {social_data.map((s) => (
                <a
                  href={s.link}
                  key={s.id}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all duration-300"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Khám Phá</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/shop" className="hover:text-white transition-colors">Sản phẩm mới</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Bộ sưu tập</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Bán chạy nhất</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Khuyến mãi</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Hỗ Trợ Khách Hàng</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/profile" className="hover:text-white transition-colors">Tài khoản của tôi</Link></li>
              <li><Link to="/history-order" className="hover:text-white transition-colors">Lịch sử đơn hàng</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Liên hệ</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Liên Hệ</h4>
            <div className="space-y-4 text-gray-400">
              <p>Bạn có câu hỏi? Gọi ngay:</p>
              <a href="tel:+84337373733" className="text-2xl font-bold text-white hover:text-blue-400 transition-colors block">
                +84 337 373 733
              </a>
              <div className="flex items-center gap-3 mt-4">
                <Email className="w-5 h-5" />
                <a href="mailto:support@novafashion.vn" className="hover:text-white transition-colors">
                  support@novafashion.vn
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Location className="w-5 h-5 mt-1" />
                <span>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} NOVA FASHION. All rights reserved.
          </p>
          <img src={pay} alt="Payment Methods" className="h-8 opacity-70" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
