"use strict";

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const process = require("process");
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
const {
  resetPasswordCodeForm,
  confirmAccountCodeForm,
} = require("../utils/emailExtension");

const RolesUser = {
  USER: "USER",
  ADMIN: "ADMIN",
};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

class AccessService {
  static singUp = async ({ userName, email, phone, password }) => {
    const hodelUser = await User.findOne({ email }).lean();
    if (hodelUser) {
      throw new badRequestError("error user already rigisted");
    }
    const passwordHash = await bcrypt.hash(password, 10);

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

    const user = await User.create({
      userName,
      email,
      phone,
      password: passwordHash,
      roles: [RolesUser.USER],
      status: "inActive",
      verificationCode,
      verificationCodeExpiry,
      verificationCodeType: "confirm",
    });

    const confirmAccountFormContent = confirmAccountCodeForm(
      userName,
      verificationCode
    );
    await sendEmail(
      user.email,
      confirmAccountFormContent.title,
      confirmAccountFormContent.body
    );

    return {
      message: "Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra email.",
      data: {
        email: user.email,
      },
    };
  };

  static verifyAccount = async ({ email, code }) => {
    const user = await User.findOne({ email }).lean();

    if (!user) {
      throw new NotFoundError("Không tìm thấy tài khoản");
    }

    if (user.status === "active") {
      throw new badRequestError("Tài khoản đã được kích hoạt");
    }

    if (user.verificationCode !== code) {
      throw new badRequestError("Mã xác thực không đúng");
    }

    if (new Date() > new Date(user.verificationCodeExpiry)) {
      throw new badRequestError("Mã xác thực đã hết hạn");
    }

    if (user.verificationCodeType !== "confirm") {
      throw new badRequestError("Mã xác thực không hợp lệ");
    }

    await User.findOneAndUpdate(
      { email },
      {
        status: "active",
        verificationCode: null,
        verificationCodeExpiry: null,
        verificationCodeType: null,
      }
    );

    return {
      message: "Xác thực tài khoản thành công",
    };
  };

  static resendVerificationCode = async ({ email }) => {
    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFoundError("Không tìm thấy tài khoản");
    }

    if (user.status === "active") {
      throw new badRequestError("Tài khoản đã được kích hoạt");
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await User.findOneAndUpdate(
      { email },
      {
        verificationCode,
        verificationCodeExpiry,
        verificationCodeType: "confirm",
      }
    );

    const confirmAccountFormContent = confirmAccountCodeForm(
      user.userName,
      verificationCode
    );
    await sendEmail(
      user.email,
      confirmAccountFormContent.title,
      confirmAccountFormContent.body
    );

    return {
      message: "Mã xác thực mới đã được gửi đến email của bạn",
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
      throw new badRequestError("Tài khoản bị khóa hoặc chưa được kích hoạt");

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
    const user = await User.findOne({ email });

    if (!user) throw new NotFoundError("Không tìm thấy tài khoản");

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await User.findOneAndUpdate(
      { email },
      {
        verificationCode,
        verificationCodeExpiry,
        verificationCodeType: "resetPassword",
      }
    );

    const resetPasswordFormContent = resetPasswordCodeForm(
      user.userName,
      verificationCode
    );
    await sendEmail(
      user.email,
      resetPasswordFormContent.title,
      resetPasswordFormContent.body
    );

    return {
      message: "Mã xác thực đã được gửi đến email của bạn",
      data: {
        email: user.email,
      },
    };
  };

  static verifyResetCode = async ({ email, code }) => {
    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFoundError("Không tìm thấy tài khoản");
    }

    if (user.verificationCode !== code) {
      throw new badRequestError("Mã xác thực không đúng");
    }

    if (new Date() > new Date(user.verificationCodeExpiry)) {
      throw new badRequestError("Mã xác thực đã hết hạn");
    }

    if (user.verificationCodeType !== "resetPassword") {
      throw new badRequestError("Mã xác thực không hợp lệ");
    }

    return {
      message: "Mã xác thực hợp lệ",
      data: {
        email: user.email,
      },
    };
  };

  static resetPassword = async ({ email, code, password }) => {
    const user = await User.findOne({ email });

    if (!user) throw new NotFoundError("Không tìm thấy tài khoản");

    if (user.verificationCode !== code) {
      throw new badRequestError("Mã xác thực không đúng");
    }

    if (new Date() > new Date(user.verificationCodeExpiry)) {
      throw new badRequestError("Mã xác thực đã hết hạn");
    }

    if (user.verificationCodeType !== "resetPassword") {
      throw new badRequestError("Mã xác thực không hợp lệ");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { email },
      {
        password: passwordHash,
        verificationCode: null,
        verificationCodeExpiry: null,
        verificationCodeType: null,
      }
    );

    return {
      message: "Đặt lại mật khẩu thành công",
    };
  };

  static confirmAccount = async (user, keyStore) => {
    const { userId, email } = user;
    const userExiting = await findByEmail({ email });
    if (!userExiting?._id && userId) throw new NotFoundError("Not found User");
    const userUpdated = await User.findOneAndUpdate(userExiting._id, {
      ...userExiting,
      status: "active",
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