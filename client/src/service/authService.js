import instance from "../config/instance";

const customerRegisterApi = (formData) => {
  return instance.post("/register", formData);
};
const customerLoginAPi = (formData) => {
  return instance.post("/login", formData);
};

export { customerRegisterApi, customerLoginAPi };
