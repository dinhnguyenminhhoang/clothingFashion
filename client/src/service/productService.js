import instance from "../config/instance";

const getProductByType = (type, limit) => {
  return instance.get(`/product-type/${type}`, { params: { limit } });
};
const getAllProduct = ({ page = 1, limit = 6, filters = {} }) => {
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...filters,
  }).toString();

  const response = instance.get(`/product?${queryParams}`);
  return response;
};

const getProductDetail = (productId) => {
  return instance.get(`/product/${productId}`);
};
export { getProductByType, getProductDetail, getAllProduct };
