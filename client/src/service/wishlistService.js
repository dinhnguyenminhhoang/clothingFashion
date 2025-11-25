import instance from "../config/instance";

export const getUserWishlist = () => {
    return instance.get("/favorite");
};

export const addToWishlist = (productId) => {
    return instance.post("/favorite", { productId });
};

export const removeFromWishlist = (productId) => {
    return instance.delete(`/favorite/${productId}`);
};

export const toggleWishlist = (productId) => {
    return instance.post("/favorite/toggle", { productId });
};

export const checkFavorite = (productId) => {
    return instance.get(`/favorite/check/${productId}`);
};

export const syncWishlist = (productIds) => {
    return instance.post("/favorite/sync", { productIds });
};

export const checkFavorites = (productIds) => {
    return instance.post("/favorite/check-bulk", { productIds });
};
