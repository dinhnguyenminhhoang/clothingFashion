import instance from "../config/instance";

const createReview = (formData) => {
  return instance.post(`/review`, formData);
};

const getProductReviews = (productId) => {
  // Reviews are embedded in product data from product API
  return instance.get(`/product/${productId}`);
};

const deleteReview = (reviewId) => {
  return instance.delete(`/review/${reviewId}`);
};

const getHighRatedReviews = (limit = 10) => {
  return instance.get(`/review/high-rated?limit=${limit}`);
};

export { createReview, getProductReviews, deleteReview, getHighRatedReviews };
