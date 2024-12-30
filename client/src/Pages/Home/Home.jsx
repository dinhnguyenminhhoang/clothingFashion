import React from "react";
import HomeHeroSlider from "../../Components/HomeHeroSlider/HomeHeroSlider";
import ProductArea from "../../Components/ProductArea/ProductArea";
import TitleResuable from "../../Components/TitleResuable/TitleResuable";

const Home = () => {
  return (
    <>
      <HomeHeroSlider />
      <ProductArea />
      <>
        <TitleResuable
          title="Sản phẩm phổ biến"
          description="Khám phá các sản phẩm được yêu thích nhất tại cửa hàng."
        />
      </>
      <>
        <TitleResuable
          title="Áo thời trang"
          description="Những mẫu áo đang được ưa chuộng hiện nay."
        />
      </>
      <>
        <TitleResuable
          title="Quần thời trang"
          description="Những kiểu quần hợp thời và được yêu thích."
        />
      </>
    </>
  );
};

export default Home;
