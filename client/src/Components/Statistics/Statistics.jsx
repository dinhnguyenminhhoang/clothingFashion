import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import {
  ShoppingOutlined,
  UserOutlined,
  TrophyOutlined,
  SmileOutlined,
} from "@ant-design/icons";

const Statistics = () => {
  const [startCount, setStartCount] = useState(false);

  useEffect(() => {
    setStartCount(true);
  }, []);

  const stats = [
    {
      id: 1,
      icon: <ShoppingOutlined className="text-5xl text-blue-600" />,
      count: 10000,
      suffix: "+",
      label: "Sản phẩm",
    },
    {
      id: 2,
      icon: <UserOutlined className="text-5xl text-purple-600" />,
      count: 50000,
      suffix: "+",
      label: "Khách hàng",
    },
    {
      id: 3,
      icon: <TrophyOutlined className="text-5xl text-yellow-600" />,
      count: 100,
      suffix: "+",
      label: "Thương hiệu",
    },
    {
      id: 4,
      icon: <SmileOutlined className="text-5xl text-green-600" />,
      count: 99,
      suffix: "%",
      label: "Hài lòng",
    },
  ];

  return (
    <div className="section-padding bg-gray-50">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="text-center p-6 bg-white rounded-xl shadow-soft hover:shadow-hover transition-all duration-300 hover-lift"
            >
              <div className="mb-4 flex justify-center">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                {startCount && (
                  <CountUp
                    start={0}
                    end={stat.count}
                    duration={2.5}
                    separator=","
                    suffix={stat.suffix}
                  />
                )}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
