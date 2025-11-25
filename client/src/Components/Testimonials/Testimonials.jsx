import React, { useEffect, useState } from "react";
import { Rate, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { getHighRatedReviews } from "../../service/reviewService";
import { IMAGEURL } from "../../utils/constant";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await getHighRatedReviews(10);
        if (res.status === 200 && res.data.length > 0) {
          setTestimonials(res.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="section-padding bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Khách hàng nói gì về chúng tôi
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Hàng ngàn khách hàng đã tin tưởng và hài lòng với sản phẩm của chúng tôi
          </p>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          breakpoints={{
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="pb-12"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial._id}>
              <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <Rate
                    disabled
                    defaultValue={testimonial.rating}
                    className="text-yellow-400 text-sm"
                  />
                  <span className="text-xs text-gray-400">
                    {new Date(testimonial.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-6 text-base leading-relaxed italic flex-grow">
                  "{testimonial.comment}"
                </p>
                
                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-200">
                  <Avatar
                    size={48}
                    src={testimonial.user?.avatar ? IMAGEURL + testimonial.user.avatar : null}
                    icon={!testimonial.user?.avatar && <UserOutlined />}
                    className="bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-white shadow-sm"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {testimonial.user?.userName || testimonial.user?.name || "Khách hàng ẩn danh"}
                    </h4>
                    {testimonial.product && (
                      <p className="text-xs text-blue-600 mt-0.5 line-clamp-1">
                        Đã mua: {testimonial.product.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Testimonials;
