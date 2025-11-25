"use strict";

const { badRequestError } = require("../core/error.response");
const { User } = require("../models/user.model");
const { paginate } = require("../utils/paginate");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

class UserService {
  static getUserInfo = async (user) => {
    return await User.findById(user.userId).select({
      _id: 1,
      userName: 1,
      phone: 1,
      email: 1,
      avatar: 1,
      address: 1,
    });
  };

  static addAddress = async (userId, addressData) => {
    const user = await User.findById(userId);
    if (!user) throw new badRequestError("User not found");

    if (addressData.isDefault) {
      user.address.forEach((addr) => (addr.isDefault = false));
    } else if (user.address.length === 0) {
      addressData.isDefault = true;
    }

    user.address.push(addressData);
    await user.save();
    return user.address;
  };

  static updateAddress = async (userId, addressId, addressData) => {
    const user = await User.findById(userId);
    if (!user) throw new badRequestError("User not found");

    const addressIndex = user.address.findIndex(
      (addr) => addr._id.toString() === addressId
    );
    if (addressIndex === -1) throw new badRequestError("Address not found");

    if (addressData.isDefault) {
      user.address.forEach((addr) => (addr.isDefault = false));
    }

    user.address[addressIndex] = { ...user.address[addressIndex].toObject(), ...addressData };
    await user.save();
    return user.address;
  };

  static deleteAddress = async (userId, addressId) => {
    const user = await User.findById(userId);
    if (!user) throw new badRequestError("User not found");

    user.address = user.address.filter(
      (addr) => addr._id.toString() !== addressId
    );
    await user.save();
    return user.address;
  };

  static getAddresses = async (userId) => {
    const user = await User.findById(userId).select("address");
    if (!user) throw new badRequestError("User not found");
    return user.address;
  };
  static updateProfile = async (payload, user) => {
    return await User.findByIdAndUpdate(user.userId, payload, {
      new: true,
    }).lean();
  };
  static getAllUser = async ({
    limit = 10,
    page = 1,
    filters = { status: "active" },
    options,
    ...query
  }) => {
    let users = await paginate({
      model: User,
      limit: +limit,
      page: +page,
      filters,
      options,
      projection: [
        "email",
        "userName",
        "roles",
        "phone",
        "status",
        "createdAt",
      ],
    });
    return users;
  };
  static deleteUser = async (userId) => {
    return await User.findByIdAndUpdate(
      userId,
      { status: "inActive" },
      {
        new: true,
      }
    ).lean();
  };
  static createUser = async ({ userName, email, phone, password, roles }) => {
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
      roles: roles,
    });
    return {
      data: null,
    };
  };
  static updateUser = async (userId, payload) => {
    return await User.findByIdAndUpdate(userId, payload, {
      new: true,
    }).lean();
  };
}
module.exports = UserService;
