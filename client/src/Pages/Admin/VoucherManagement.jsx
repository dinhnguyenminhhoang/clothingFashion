import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, message, Tag, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllVouchers, createVoucher, updateVoucher, deleteVoucher } from '../../service/voucherService';
import { formatCurrencyVND } from '../../utils';
import moment from 'moment';

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [form] = Form.useForm();
  
  const fetchVouchers = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const res = await getAllVouchers({ page, limit: pageSize });
      if (res.status === 200) {
        setVouchers(res.data.data);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: res.data.meta.total
        });
      }
    } catch (error) {
      message.error("Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchVouchers();
  }, []);
  
  const handleTableChange = (pagination) => {
    fetchVouchers(pagination.current, pagination.pageSize);
  };
  
  const handleAdd = () => {
    setEditingVoucher(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  const handleEdit = (voucher) => {
    setEditingVoucher(voucher);
    form.setFieldsValue({
      ...voucher,
      startDate: moment(voucher.startDate),
      expiryDate: moment(voucher.expiryDate)
    });
    setModalVisible(true);
  };
  
  const handleDelete = async (id) => {
    try {
      await deleteVoucher(id);
      message.success("Xóa voucher thành công");
      fetchVouchers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error("Không thể xóa voucher");
    }
  };
  
  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        startDate: values.startDate.toISOString(),
        expiryDate: values.expiryDate.toISOString()
      };
      
      if (editingVoucher) {
        await updateVoucher(editingVoucher._id, data);
        message.success("Cập nhật voucher thành công");
      } else {
        await createVoucher(data);
        message.success("Tạo voucher thành công");
      }
      
      setModalVisible(false);
      fetchVouchers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };
  
  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code) => <Tag color="blue" className="font-mono font-bold">{code}</Tag>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Loại / Giá trị',
      key: 'discount',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.discountType === 'percentage' ? (
              <Tag color="orange">{record.discountValue}%</Tag>
            ) : (
              <Tag color="green">{formatCurrencyVND(record.discountValue)}</Tag>
            )}
          </div>
          {record.maxDiscount && (
            <div className="text-xs text-gray-500">
              Tối đa: {formatCurrencyVND(record.maxDiscount)}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      width: 130,
      render: (value) => <span className="text-xs">{formatCurrencyVND(value)}</span>
    },
    {
      title: 'Thời gian',
      key: 'date',
      width: 180,
      render: (_, record) => (
        <div className="text-xs">
          <div className="text-gray-600">
            Từ: {moment(record.startDate).format('DD/MM/YYYY HH:mm')}
          </div>
          <div className="text-gray-600">
            Đến: {moment(record.expiryDate).format('DD/MM/YYYY HH:mm')}
          </div>
        </div>
      )
    },
    {
      title: 'Sử dụng',
      key: 'usage',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div className="text-center">
          <div className="font-bold text-blue-600">{record.usedCount}</div>
          <div className="text-xs text-gray-500">/ {record.usageLimit || '∞'}</div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const now = new Date();
        const isExpired = new Date(record.expiryDate) < now;
        const isNotStarted = new Date(record.startDate) > now;
        const isLimitReached = record.usageLimit && record.usedCount >= record.usageLimit;
        
        if (!record.isActive) return <Tag color="default">Đã tắt</Tag>;
        if (isExpired) return <Tag color="red">Hết hạn</Tag>;
        if (isNotStarted) return <Tag color="orange">Chưa bắt đầu</Tag>;
        if (isLimitReached) return <Tag color="volcano">Đã hết lượt</Tag>;
        return <Tag color="green">Hoạt động</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa voucher này?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small"
              danger
            />
          </Popconfirm>
        </Space>
      )
    }
  ];
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Voucher</h1>
            <p className="text-gray-500 text-sm">Tạo và quản lý mã giảm giá cho khách hàng</p>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Thêm Voucher
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
          <Table
            columns={columns}
            dataSource={vouchers}
            loading={loading}
            rowKey="_id"
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
          />
        </div>
      </div>
      
      <Modal
        title={
          <div className="text-xl font-bold">
            {editingVoucher ? "✏️ Sửa Voucher" : "➕ Thêm Voucher"}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
        okText={editingVoucher ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="code"
            label="Mã Voucher"
            rules={[
              { required: true, message: 'Vui lòng nhập mã voucher' },
              { pattern: /^[A-Z0-9]+$/, message: 'Chỉ chấp nhận chữ hoa và số' }
            ]}
          >
            <Input placeholder="VD: SUMMER2024" maxLength={20} />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea 
              rows={2} 
              placeholder="Mô tả ngắn gọn về voucher này..."
              maxLength={200}
            />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="discountType"
              label="Loại giảm giá"
              rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
            >
              <Select placeholder="Chọn loại giảm giá">
                <Select.Option value="percentage">
                  <span>📊 Phần trăm (%)</span>
                </Select.Option>
                <Select.Option value="fixed">
                  <span>💰 Cố định (VNĐ)</span>
                </Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="discountValue"
              label="Giá trị giảm"
              rules={[
                { required: true, message: 'Vui lòng nhập giá trị' },
                { type: 'number', min: 0, message: 'Giá trị phải lớn hơn 0' }
              ]}
            >
              <InputNumber 
                min={0} 
                className="w-full" 
                placeholder="Nhập giá trị"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="maxDiscount"
              label="Giảm tối đa (VNĐ)"
              tooltip="Áp dụng cho loại phần trăm, để trống = không giới hạn"
            >
              <InputNumber 
                min={0} 
                className="w-full" 
                placeholder="Không giới hạn"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
            
            <Form.Item
              name="minOrderValue"
              label="Đơn hàng tối thiểu (VNĐ)"
              initialValue={0}
            >
              <InputNumber 
                min={0} 
                className="w-full"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
            >
              <DatePicker 
                showTime 
                className="w-full" 
                format="DD/MM/YYYY HH:mm"
                placeholder="Chọn ngày giờ"
              />
            </Form.Item>
            
            <Form.Item
              name="expiryDate"
              label="Ngày hết hạn"
              rules={[
                { required: true, message: 'Vui lòng chọn ngày hết hạn' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('startDate')) {
                      return Promise.resolve();
                    }
                    if (value.isAfter(getFieldValue('startDate'))) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Ngày hết hạn phải sau ngày bắt đầu'));
                  },
                }),
              ]}
            >
              <DatePicker 
                showTime 
                className="w-full" 
                format="DD/MM/YYYY HH:mm"
                placeholder="Chọn ngày giờ"
              />
            </Form.Item>
          </div>
          
          <Form.Item
            name="usageLimit"
            label="Giới hạn sử dụng"
            tooltip="Số lần voucher có thể được sử dụng. Để trống = không giới hạn"
          >
            <InputNumber 
              min={1} 
              placeholder="Không giới hạn" 
              className="w-full"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
          
          <Form.Item
            name="isActive"
            label="Trạng thái"
            initialValue={true}
          >
            <Select>
              <Select.Option value={true}>
                <Tag color="green">Hoạt động</Tag>
              </Select.Option>
              <Select.Option value={false}>
                <Tag color="default">Tạm tắt</Tag>
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VoucherManagement;
