import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, Modal, Radio, Tag, message, Space, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { addAddress, deleteAddress, getAddresses, updateAddress } from "../../service/userService";

const AddressManager = ({ onSelect, selectedId, mode = "manage" }) => {
  const [addresses, setAddresses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await getAddresses();
      if (res.status === 200) {
        // Handle both cases: res.data.data or res.data
        const addressData = res.data.data || res.data || [];
        setAddresses(Array.isArray(addressData) ? addressData : []);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setAddresses([]); // Set empty array on error
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAdd = () => {
    setEditingAddress(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    form.setFieldsValue(address);
    setIsModalVisible(true);
  };

  const handleDelete = async (addressId) => {
    try {
      await deleteAddress(addressId);
      message.success("Xóa địa chỉ thành công");
      fetchAddresses();
    } catch (error) {
      message.error("Không thể xóa địa chỉ");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await updateAddress(addressId, { isDefault: true });
      message.success("Đã đặt làm địa chỉ mặc định");
      fetchAddresses();
    } catch (error) {
      message.error("Lỗi khi đặt mặc định");
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editingAddress) {
        await updateAddress(editingAddress._id, values);
        message.success("Cập nhật địa chỉ thành công");
      } else {
        await addAddress(values);
        message.success("Thêm địa chỉ mới thành công");
      }
      setIsModalVisible(false);
      fetchAddresses();
    } catch (error) {
      console.error("Error saving address:", error);
      message.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Sổ Địa Chỉ</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm địa chỉ mới
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {addresses && addresses.length > 0 ? (
          addresses.map((addr) => (
            <Card
              key={addr._id}
              className={`cursor-pointer transition-all border-2 ${
                mode === "select" && selectedId === addr._id
                  ? "border-blue-500 bg-blue-50"
                  : "border-transparent hover:border-gray-200"
              } shadow-sm`}
              onClick={() => mode === "select" && onSelect && onSelect(addr)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">{addr.recipientName}</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-600">{addr.phone}</span>
                    {addr.isDefault && <Tag color="green">Mặc định</Tag>}
                  </div>
                  <p className="text-gray-600">{addr.address}</p>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  {mode === "manage" && (
                    <Space>
                      {!addr.isDefault && (
                        <Button 
                          size="small" 
                          type="text" 
                          className="text-blue-600"
                          onClick={() => handleSetDefault(addr._id)}
                        >
                          Đặt mặc định
                        </Button>
                      )}
                      <Button 
                        icon={<EditOutlined />} 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(addr);
                        }}
                      />
                      <Popconfirm
                        title="Bạn có chắc muốn xóa địa chỉ này?"
                        onConfirm={(e) => {
                          e.stopPropagation();
                          handleDelete(addr._id);
                        }}
                        onCancel={(e) => e.stopPropagation()}
                        okText="Xóa"
                        cancelText="Hủy"
                      >
                        <Button 
                          icon={<DeleteOutlined />} 
                          size="small" 
                          danger 
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    </Space>
                  )}
                  {mode === "select" && selectedId === addr._id && (
                    <CheckCircleOutlined className="text-2xl text-blue-500" />
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="mb-2">Chưa có địa chỉ nào</p>
            <p className="text-sm">Thêm địa chỉ mới để bắt đầu</p>
          </div>
        )}
      </div>

      <Modal
        title={editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="recipientName"
            label="Tên người nhận"
            rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn A" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input placeholder="Ví dụ: 0901234567" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ chi tiết"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input.TextArea rows={3} placeholder="Ví dụ: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM" />
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked">
            <Radio>Đặt làm địa chỉ mặc định</Radio>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddressManager;
