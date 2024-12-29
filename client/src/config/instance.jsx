import axios from "axios";
import Cookie from "js-cookie";

const instance = axios.create({
  baseURL: "http://localhost:3055/v1/api",
});

instance.interceptors.request.use(
  function (config) {
    const token = Cookie.get("token");
    const userId = Cookie.get("userId");
    if (userId) {
      config.headers["x-client-id"] = userId;
    }
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default instance;
