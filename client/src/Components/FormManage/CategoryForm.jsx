import { Button, Form, Input, Upload, message } from "antd";
import { UploadOutlined, PictureOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { IMAGEURL } from "../../utils/constant";

const CategoryForm = ({ initialValues, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    form.resetFields();
    setFileList([]);
    setImagePreview(null);
    
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
      });
      
      // Set image preview if exists
      if (initialValues.image) {
        setImagePreview(IMAGEURL + initialValues.image);
      }
    }
  }, [initialValues, form]);

  const handleFinish = (values) => {
    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description || "");
    
    // Append image file if exists
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("image", fileList[0].originFileObj);
    }
    
    onSave(formData);
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1)); // Only keep the last file
    
    // Create preview
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(newFileList[0].originFileObj);
    } else {
      setImagePreview(null);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ có thể upload file ảnh!");
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent auto upload
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical">
      <Form.Item
        name="name"
        label="Tên danh mục"
        rules={[
          {
            required: true,
            message: "Vui lòng nhập tên danh mục!",
          },
        ]}
      >
        <Input placeholder="VD: Áo thun, Quần jean..." />
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
        rules={[
          {
            required: true,
            message: "Vui lòng nhập mô tả!",
          },
        ]}
      >
        <Input.TextArea 
          rows={3} 
          placeholder="Mô tả ngắn về danh mục này..."
        />
      </Form.Item>

      <Form.Item label="Ảnh danh mục">
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={handleUploadChange}
          beforeUpload={beforeUpload}
          maxCount={1}
        >
          {fileList.length === 0 && (
            <div>
              <PictureOutlined style={{ fontSize: 32, color: "#999" }} />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-gray-200"
            />
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          * Ảnh sẽ hiển thị trong Featured Categories. Kích thước đề xuất: 500x600px
        </p>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" size="large">
          Lưu
        </Button>
        <Button onClick={onCancel} size="large" style={{ marginLeft: "8px" }}>
          Hủy
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CategoryForm;
