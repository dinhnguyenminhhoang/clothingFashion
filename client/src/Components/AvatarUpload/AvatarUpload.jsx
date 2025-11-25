import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Upload, message } from "antd";
import React, { useState } from "react";
import instance from "../../config/instance";
import { IMAGEURL } from "../../utils/constant";

const AvatarUpload = ({ currentAvatar, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar || "");

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await instance.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (response.status === 200) {
        const url = response.data[0].path;
        setAvatarUrl(url);
        onUpdate(url);
        message.success("Cập nhật avatar thành công!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      message.error("Upload thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ có thể upload file ảnh!");
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return false;
    }
    
    handleUpload(file);
    return false;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar
        size={120}
        src={avatarUrl ? IMAGEURL + avatarUrl : null}
        icon={!avatarUrl && <UserOutlined />}
        className="bg-gradient-to-r from-blue-500 to-purple-600"
      />
      
      <Upload
        beforeUpload={beforeUpload}
        showUploadList={false}
        maxCount={1}
      >
        <Button loading={uploading} type="default" className="shadow-sm">
          {avatarUrl ? "Thay đổi avatar" : "Tải lên avatar"}
        </Button>
      </Upload>
      
      <p className="text-xs text-gray-500 text-center">
        Định dạng: JPG, PNG • Tối đa: 2MB
      </p>
    </div>
  );
};

export default AvatarUpload;
