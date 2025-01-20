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
const sendEmail = require("../helpers/sendEmail");
const { resetPasswordForm } = require("../utils/emailExtension");
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
    if (foundUser.status !== "active")
      throw new badRequestError("Tài khoản bị khóa");
    const { _id: userId, userName, roles, phone } = foundUser;
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) throw new AuthFailureError("Authentication Error");
    const key = crypto.randomBytes(64).toString(`hex`);
    const tokens = await createTokenPair(
      {
        userId: userId,
        email: email,
        userName,
        phone,
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
  static forgotPassword = async (payload) => {
    const { email } = payload;
    const user = await findByEmail({ email });
    if (!user?._id) throw new NotFoundError("Not found User");
    const key = crypto.randomBytes(64).toString(`hex`);
    const tokens = await createTokenPair(
      {
        userId: user._id,
        email: user.email,
        userName: user.userName,
        phone: user.phone,
        type: "resetPassword",
      },
      key
    );
    await KeyTokenService.createKeyToken({
      userId: user._id,
      key,
    });
    const resetLink = `http://localhost:5173/reset-password/${tokens.accessToken}`;
    const resetPasswordFormContent = resetPasswordForm(resetLink);
    await sendEmail(
      user.email,
      resetPasswordFormContent.title,
      resetPasswordFormContent.body
    );
    return "OK";
  };
  static resetPassword = async (payload, user, keyStore) => {
    const { userId, email } = user;
    const { password } = payload;
    const userExiting = await findByEmail({ email });
    if (!userExiting?._id && userId) throw new NotFoundError("Not found User");
    const passwordHash = await bcrypt.hash(password, 10);
    const userUpdated = await User.findOneAndUpdate(userExiting._id, {
      ...userExiting,
      password: passwordHash,
    });
    if (userUpdated) {
      await KeyTokenService.removeKeyById(keyStore._id);
    } else throw badRequestError("reset password faild");
    return "OK";
  };
  static Logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };
}
module.exports = AccessService;
