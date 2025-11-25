import instance from "../config/instance";

export const validateVoucher = (code, orderData) => {
    return instance.post("/voucher/validate", { code, orderData });
};

export const getActiveVouchers = () => {
    return instance.get("/voucher/active");
};

// Admin methods
export const createVoucher = (data) => {
    return instance.post("/voucher", data);
};

export const getAllVouchers = (params) => {
    const query = new URLSearchParams(params).toString();
    return instance.get(`/voucher/admin?${query}`);
};

export const getVoucherById = (id) => {
    return instance.get(`/voucher/${id}`);
};

export const updateVoucher = (id, data) => {
    return instance.put(`/voucher/${id}`, data);
};

export const deleteVoucher = (id) => {
    return instance.delete(`/voucher/${id}`);
};
