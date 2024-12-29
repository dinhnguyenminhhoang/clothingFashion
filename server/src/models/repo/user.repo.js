"use strict";

const { User } = require("../user.model");

const findByEmail = async ({
  email,
  seclect = {
    email: 1,
    password: 1,
    status: 1,
    roles: 1,
    userName: 1,
  },
}) => {
  return await User.findOne({ email: email }).select(seclect).lean();
};
module.exports = { findByEmail };
