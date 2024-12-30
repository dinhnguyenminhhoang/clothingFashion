import React from "react";
import logo from "../../assets/logo.svg";
import pay from "../../assets/img/footer/footer-pay.png";
import { Email, Location } from "../../svg/index";
import { Link } from "react-router-dom";
import {
  FacebookOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

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
    <footer className="mt-10">
      <div className="bg-gray-200 pt-16 pb-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="mb-8">
              <div className="mb-6">
                <Link href="/">
                  <img src={logo} alt="logo" />
                </Link>
              </div>
              <p className="text-gray-600">
                We are a dynamic team of full stack developers and designers
                crafting high-quality web applications.
              </p>
              <div className="flex space-x-4 mt-4">
                {social_data.map((s) => (
                  <a
                    href={s.link}
                    key={s.id}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-500 hover:text-blue-500"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4">My Account</h4>
              <ul className="text-gray-600 space-y-2">
                <li>
                  <a href="#" className="hover:text-blue-500">
                    Track Orders
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500">
                    Shipping
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500">
                    Wishlist
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500">
                    My Account
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500">
                    Order History
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500">
                    Returns
                  </a>
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4">Information</h4>
              <ul className="text-gray-600 space-y-2">
                <li>
                  <a href="#" className="hover:text-blue-500">
                    Our Story
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500">
                    Latest News
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4">Talk To Us</h4>
              <div className="mb-6">
                <span className="block text-gray-600">
                  Got Questions? Call us
                </span>
                <h4 className="text-xl font-bold">
                  <a href="tel:670-413-90-762" className="hover:text-blue-500">
                    +84337373733
                  </a>
                </h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="mr-4 text-gray-500">
                    <Email />
                  </span>
                  <p>
                    <a
                      href="mailto:dinhnguyenminhhoang@gmail.com"
                      className="hover:text-blue-500"
                    >
                      dinhnguyenminhhoang@gmail.com
                    </a>
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="mr-4 text-gray-500">
                    <Location />
                  </span>
                  <p>
                    <a
                      href="https://www.google.com/maps/place/Sleepy+Hollow+Rd,+Gouverneur,+NY+13642,+USA/@44.3304966,-75.4552367,17z/data=!3m1!4b1!4m6!3m5!1s0x4cccddac8972c5eb:0x56286024afff537a!8m2!3d44.3304928!4d-75.453048!16s%2Fg%2F1tdsjdj4"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-blue-500"
                    >
                      Ho CHi Minh
                      <br />
                      Thu Duc
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-gray-600">
            <p className="text-sm">
              © {new Date().getFullYear()} All Rights Reserved | React.js
            </p>
            <div className="mt-4 md:mt-0">
              <img src={pay} alt="pay" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
