import instance from "../config/instance";

const getSummaryTotal = () => {
  return instance.get(`/summary/total`);
};

const getSummaryUser = (type) => {
  return instance.get(`/summary/user/${type}`);
};
const getSummaryBrand = (type) => {
  return instance.get(`/summary/brand/${type}`);
};

const getSummaryProduct = (type) => {
  return instance.get(`/summary/product/${type}`);
};

const getSummaryOrder = (type) => {
  return instance.get(`/summary/order/${type}`);
};

const getRevenueSummary = (type) => {
  return instance.get(`/summary/revenue/${type}`);
};

const getOrderStatusSummary = () => {
  return instance.get(`/summary/order-status`);
};

const getTopProducts = () => {
  return instance.get(`/summary/top-products`);
};

const getRecentOrders = () => {
  return instance.get(`/summary/recent-orders`);
};

export {
  getSummaryTotal,
  getSummaryBrand,
  getSummaryUser,
  getSummaryProduct,
  getSummaryOrder,
  getRevenueSummary,
  getOrderStatusSummary,
  getTopProducts,
  getRecentOrders,
};
