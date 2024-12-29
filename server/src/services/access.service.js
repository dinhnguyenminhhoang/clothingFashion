"use strict";

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const {
  badRequestError,
  AuthFailureError,
  NotFoundError,
} = require("../core/error.response");
const { User } = require("../models/user.model");
const { findByEmail } = require("../models/repo/user.repo");
const { getInfoData } = require("../utils");
const RolesUser = {
  USER: "USER",
  ADMIN: "ADMIN",
};

class AccessService {
  static singUp = async ({ userName, email, phone, password }) => {
    const hodelUser = await User.findOne({ email }).lean();
    if (hodelUser) {
      throw new badRequestError("error user already rigisted");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      userName,
      email,
      phone,
      password: passwordHash,
      roles: [RolesUser.USER],
    });
    return {
      data: null,
    };
  };
  static login = async ({ email, password }) => {
    const foundUser = await findByEmail({
      email,
    });
    if (!foundUser) {
      throw new badRequestError("user not registered");
    }
    const { _id: userId, userName, roles } = foundUser;
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) throw new AuthFailureError("Authentication Error");
    const key = crypto.randomBytes(64).toString(`hex`);
    const tokens = await createTokenPair(
      {
        userId: userId,
        email: email,
        userName,
        role: roles,
      },
      key
    );
    await KeyTokenService.createKeyToken({
      userId: userId,
      key,
    });
    return {
      user: getInfoData({
        fill: ["_id", "userName", "email", "phone"],
        object: foundUser,
      }),
      tokens,
    };
  };
  static Logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };
}
module.exports = AccessService;
