import instance from "../config/instance";

const getProductByType = (type, limit) => {
  return instance.get(`/product-type/${type}`, { params: { limit } });
};

const getProductDetail = (productId) => {
  return instance.get(`/product/${productId}`);
};
export { getProductByType, getProductDetail };
