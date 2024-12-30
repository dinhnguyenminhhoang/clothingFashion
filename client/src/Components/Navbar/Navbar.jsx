import {
  ContactsOutlined,
  HomeOutlined,
  ProductOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Input } from "antd";
import React from "react";

const Navbar = () => {
  return (
    <div className="bg-white h-[70px] border-b border-b-black flex items-center justify-center">
      <div className="container flex items-center justify-between gap-12">
        <img src="http://localhost:3000/_next/static/media/logo.414c93a2.svg" />
        <div className="flex  ml-20 gap-4 items-center">
          <div className="flex items-center gap-2 cursor-pointer">
            <HomeOutlined className="text-xl" />
            <span className="font-bold text-xl">HOME</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <ProductOutlined className="text-xl" />
            <span className="font-bold text-xl">PRODUCT</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <ContactsOutlined className="text-xl" />
            <span className="font-bold text-xl">CONTACT</span>
          </div>
        </div>
        <div className="flex items-center flex-1">
          <Input
            className="rounded-l-full flex-1 max-w-lg border-slate-900 border py-[6px] px-4"
            placeholder="Search by product..."
          />
          <Button className="rounded-none rounded-r-full border-slate-900 border py-[17px]">
            <SearchOutlined className="text-xl" />
          </Button>
        </div>
        <div className="flex items-center gap-6">
          <Button>
            <ShoppingCartOutlined className="text-2xl" />
          </Button>
          <Avatar
            size={35}
            icon={<UserOutlined />}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
