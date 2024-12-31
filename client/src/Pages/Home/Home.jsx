import React, { useEffect, useState } from "react";
import HomeHeroSlider from "../../Components/HomeHeroSlider/HomeHeroSlider";
import ProductArea from "../../Components/ProductArea/ProductArea";
import TitleResuable from "../../Components/TitleResuable/TitleResuable";
import { getProductByType } from "../../service/productService";
import ProductItem from "../../Components/ProductItem/ProductItem";

const Home = () => {
  const [productByType, setProductByType] = useState([]);
  const [productByAo, setProductByAo] = useState([]);
  useEffect(() => {
    const fetchProductByQuan = async () => {
      try {
        const res = await getProductByType("quần");
        if (res.status === 200) {
          setProductByType(res.data);
        }
      } catch (error) {}
    };
    const fetchProductByAo = async () => {
      try {
        const res = await getProductByType("áo");
        if (res.status === 200) {
          setProductByAo(res.data);
        }
      } catch (error) {}
    };
    fetchProductByQuan();
    fetchProductByAo();
  }, []);
  return (
    <>
      <HomeHeroSlider />
      <ProductArea />
      <>
        <TitleResuable
          title="Sản phẩm phổ biến"
          description="Khám phá các sản phẩm được yêu thích nhất tại cửa hàng."
        />
        <div className="flex justify-center items-center">
          <div className="container">
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productByType?.map((product) => (
                <ProductItem key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </>

      <>
        <TitleResuable
          title="Áo thời trang"
          description="Những mẫu áo đang được ưa chuộng hiện nay."
        />
        <div className="flex justify-center items-center">
          <div className="container">
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productByAo?.map((product) => (
                <ProductItem key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </>
      <>
        <TitleResuable
          title="Quần thời trang"
          description="Những kiểu quần hợp thời và được yêu thích."
        />
        <div className="flex justify-center items-center">
          <div className="container">
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productByType?.map((product) => (
                <ProductItem key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </>
    </>
  );
};

export default Home;
