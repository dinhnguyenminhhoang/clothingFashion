import instance from "../config/instance";

const getAllCategory = ({ page = 1, limit = 6, filters = {} }) => {
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...filters,
  }).toString();

  return instance.get(`/category?${queryParams}`);
};

const deleteCategory = (categoryId) => {
  return instance.delete(`/category/${categoryId}`);
};

const createCategory = (formData) => {
  return instance.post(`/category`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const admiEditCategory = (formData, categoryId) => {
  return instance.put(`/category/${categoryId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export { getAllCategory, deleteCategory, createCategory, admiEditCategory };
