import instance from "../config/instance";

// Public methods
export const getActiveDiscounts = () => {
    return instance.get("/discounts/active");
};

export const calculateDiscount = (productId) => {
    return instance.post("/discounts/calculate", { productId });
};

// Admin methods
export const createDiscount = (data) => {
    return instance.post("/discounts", data);
};

export const getAllDiscounts = (params) => {
    const query = new URLSearchParams(params).toString();
    return instance.get(`/discounts${query ? `?${query}` : ""}`);
};

export const getDiscountById = (id) => {
    return instance.get(`/discounts/${id}`);
};

export const updateDiscount = (id, data) => {
    return instance.put(`/discounts/${id}`, data);
};

export const deleteDiscount = (id) => {
    return instance.delete(`/discounts/${id}`);
};

export const toggleDiscountStatus = (id) => {
    return instance.patch(`/discounts/${id}/toggle`);
};
