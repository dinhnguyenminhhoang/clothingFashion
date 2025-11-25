import React, { useEffect, useState } from "react";
import { Button, Input, message, Avatar } from "antd";
import { getUserProfile, updateUserProfile } from "../../service/userService";
import AddressManager from "../../Components/Address/AddressManager";
import AvatarUpload from "../../Components/AvatarUpload/AvatarUpload";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    userName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await getUserProfile();
      if (res.status === 200) {
        setUserData(res.data);
        setUpdatedData({
          userName: res.data.userName,
          email: res.data.email,
          phone: res.data.phone,
        });
      } else {
        message.error("Không thể lấy thông tin người dùng.");
      }
    };
    fetchData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const res = await updateUserProfile(updatedData);
    if (res.status === 200) {
      message.success("Cập nhật thông tin thành công!");
      setUserData({ ...userData, ...updatedData });
      setIsEditing(false);
    } else {
      message.error("Cập nhật thông tin không thành công.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarUpdate = async (avatarUrl) => {
    try {
      const res = await updateUserProfile({ avatar: avatarUrl });
      if (res.status === 200) {
        setUserData({ ...userData, avatar: avatarUrl });
      }
    } catch (error) {
      console.error("Failed to update avatar", error);
    }
  };

  if (!userData) {
    return <div>Đang tải dữ liệu...</div>;
  }

  const avatarText = userData.userName
    ? userData.userName.charAt(0).toUpperCase()
    : "";

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl border border-slate-300 shadow-lg my-20">
      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-8 pb-8 border-b">
        <AvatarUpload 
          currentAvatar={userData.avatar} 
          onUpdate={handleAvatarUpdate}
        />
        <h2 className="text-3xl font-semibold text-gray-900 mt-4">
          {userData.userName}
        </h2>
        <p className="text-lg text-gray-600">{userData.email}</p>
      </div>

      {/* Hiển thị thông tin và các trường chỉnh sửa */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tên người dùng:
          </label>
          {isEditing ? (
            <Input
              name="userName"
              value={updatedData.userName}
              onChange={handleChange}
              className="mt-2 border-gray-300 shadow-md"
            />
          ) : (
            <span className="block mt-2 text-lg text-gray-800">
              {userData.userName}
            </span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email:
          </label>
          {isEditing ? (
            <Input
              name="email"
              value={updatedData.email}
              onChange={handleChange}
              className="mt-2 border-gray-300 shadow-md"
            />
          ) : (
            <span className="block mt-2 text-lg text-gray-800">
              {userData.email}
            </span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Số điện thoại:
          </label>
          {isEditing ? (
            <Input
              name="phone"
              value={updatedData.phone}
              onChange={handleChange}
              className="mt-2 border-gray-300 shadow-md"
            />
          ) : (
            <span className="block mt-2 text-lg text-gray-800">
              {userData.phone}
            </span>
          )}
        </div>
        <div className="mt-6 flex space-x-4">
          {isEditing ? (
            <Button
              type="primary"
              onClick={handleSave}
              className="py-2 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition duration-300"
            >
              Lưu thay đổi
            </Button>
          ) : (
            <Button
              type="default"
              onClick={handleEdit}
              className="py-2 text-lg font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-300"
            >
              Cập nhật thông tin
            </Button>
          )}
        </div>
        <div className="mt-12 border-t pt-8">
          <AddressManager mode="manage" />
        </div>
      </div>
    </div>
  );
};

export default Profile;
