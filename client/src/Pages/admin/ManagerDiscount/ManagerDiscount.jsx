import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, message, Tag, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PercentageOutlined } from '@ant-design/icons';
import {
  getAllDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  toggleDiscountStatus
} from '../../../service/discountService';
import { getAllProduct } from '../../../service/productService';
import { getAllBrand } from '../../../service/brandService';
import { getAllCategory } from '../../../service/categoryService';
import moment from 'moment';

const { Option } = Select;

const DISCOUNT_TYPES = {
  PRODUCT: 'PRODUCT',
  BRAND: 'BRAND',
  CATEGORY: 'CATEGORY',
  PRODUCT_LIST: 'PRODUCT_LIST',
  GLOBAL: 'GLOBAL'
};

const ManagerDiscount = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [form] = Form.useForm();

  // Data for selectors
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedType, setSelectedType] = useState(DISCOUNT_TYPES.GLOBAL);

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
    fetchBrands();
    fetchCategories();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const res = await getAllDiscounts();
      if (res.status === 200) {
        setDiscounts(res?.data?.discounts || []);
      }
    } catch (error) {
      message.error("Không thể tải danh sách discount");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await getAllProduct({ page: 1, limit: 1000 });
      if (res.status === 200) {
        setProducts(res?.data?.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await getAllBrand({ page: 1, limit: 100 });
      console.log(res);
      if (res.status === 200) {
        setBrands(res?.data?.data || []);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getAllCategory({ page: 1, limit: 100 });
      if (res.status === 200) {
        setCategories(res?.data?.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAdd = () => {
    setEditingDiscount(null);
    form.resetFields();
    setSelectedType(DISCOUNT_TYPES.GLOBAL);
    setModalVisible(true);
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount);
    setSelectedType(discount.discountType);

    const formValues = {
      name: discount.name,
      description: discount.description,
      terms: discount.terms,
      discountType: discount.discountType,
      percentage: discount.percentage,
      priority: discount.priority,
      startDate: moment(discount.startDate),
      endDate: discount.endDate ? moment(discount.endDate) : null,
      isActive: discount.isActive
    };

    // Add type-specific fields
    if (discount.discountType === DISCOUNT_TYPES.PRODUCT && discount.product) {
      formValues.product = discount.product._id;
    } else if (discount.discountType === DISCOUNT_TYPES.BRAND && discount.brand) {
      formValues.brand = discount.brand._id;
    } else if (discount.discountType === DISCOUNT_TYPES.CATEGORY && discount.category) {
      formValues.category = discount.category._id;
    } else if (discount.discountType === DISCOUNT_TYPES.PRODUCT_LIST && discount.products) {
      formValues.products = discount.products.map(p => p._id);
    }

    form.setFieldsValue(formValues);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDiscount(id);
      message.success("Xóa discount thành công");
      fetchDiscounts();
    } catch (error) {
      message.error("Không thể xóa discount");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleDiscountStatus(id);
      message.success("Cập nhật trạng thái thành công");
      fetchDiscounts();
    } catch (error) {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        name: values.name,
        description: values.description,
        terms: values.terms,
        discountType: values.discountType,
        percentage: values.percentage,
        priority: values.priority,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate ? values.endDate.toISOString() : null,
        isActive: values.isActive
      };

      // Add type-specific field
      if (values.discountType === DISCOUNT_TYPES.PRODUCT) {
        data.product = values.product;
      } else if (values.discountType === DISCOUNT_TYPES.BRAND) {
        data.brand = values.brand;
      } else if (values.discountType === DISCOUNT_TYPES.CATEGORY) {
        data.category = values.category;
      } else if (values.discountType === DISCOUNT_TYPES.PRODUCT_LIST) {
        data.products = values.products;
      }

      if (editingDiscount) {
        await updateDiscount(editingDiscount._id, data);
        message.success("Cập nhật discount thành công");
      } else {
        await createDiscount(data);
        message.success("Tạo discount thành công");
      }

      setModalVisible(false);
      fetchDiscounts();
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDiscountTypeChange = (value) => {
    setSelectedType(value);
    form.setFieldsValue({
      product: undefined,
      brand: undefined,
      category: undefined,
      products: undefined
    });
  };

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name) => <span className="font-semibold">{name}</span>
    },
    {
      title: 'Loại',
      dataIndex: 'discountType',
      key: 'discountType',
      width: 150,
      render: (type) => {
        const typeConfig = {
          [DISCOUNT_TYPES.PRODUCT]: { color: 'blue', text: 'Sản phẩm' },
          [DISCOUNT_TYPES.BRAND]: { color: 'purple', text: 'Thương hiệu' },
          [DISCOUNT_TYPES.CATEGORY]: { color: 'cyan', text: 'Danh mục' },
          [DISCOUNT_TYPES.PRODUCT_LIST]: { color: 'geekblue', text: 'Nhiều SP' },
          [DISCOUNT_TYPES.GLOBAL]: { color: 'gold', text: 'Toàn bộ' }
        };
        const config = typeConfig[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Giảm giá',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 100,
      align: 'center',
      render: (percentage) => (
        <Tag color="orange" className="font-bold text-lg">
          {percentage}%
        </Tag>
      )
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      align: 'center',
      render: (priority) => (
        <span className="font-mono font-bold text-blue-600">{priority}</span>
      )
    },
    {
      title: 'Áp dụng cho',
      key: 'target',
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        if (record.discountType === DISCOUNT_TYPES.PRODUCT && record.product) {
          return <span className="text-sm">{record.product.title}</span>;
        } else if (record.discountType === DISCOUNT_TYPES.BRAND && record.brand) {
          return <span className="text-sm">{record.brand.name}</span>;
        } else if (record.discountType === DISCOUNT_TYPES.CATEGORY && record.category) {
          return <span className="text-sm">{record.category.name}</span>;
        } else if (record.discountType === DISCOUNT_TYPES.PRODUCT_LIST && record.products) {
          return <span className="text-sm">{record.products.length} sản phẩm</span>;
        } else if (record.discountType === DISCOUNT_TYPES.GLOBAL) {
          return <Tag color="gold">Tất cả sản phẩm</Tag>;
        }
        return '-';
      }
    },
    {
      title: 'Thời gian',
      key: 'date',
      width: 200,
      render: (_, record) => (
        <div className="text-xs">
          <div className="text-gray-600">
            Từ: {moment(record.startDate).format('DD/MM/YYYY HH:mm')}
          </div>
          {record.endDate && (
            <div className="text-gray-600">
              Đến: {moment(record.endDate).format('DD/MM/YYYY HH:mm')}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const now = new Date();
        const isExpired = record.endDate && new Date(record.endDate) < now;
        const isNotStarted = new Date(record.startDate) > now;

        if (!record.isActive) return <Tag color="default">Đã tắt</Tag>;
        if (isExpired) return <Tag color="red">Hết hạn</Tag>;
        if (isNotStarted) return <Tag color="orange">Chưa bắt đầu</Tag>;
        return <Tag color="green">Hoạt động</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Button
            size="small"
            onClick={() => handleToggleStatus(record._id)}
            type={record.isActive ? "default" : "primary"}
          >
            {record.isActive ? 'Tắt' : 'Bật'}
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa discount này?"
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
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <PercentageOutlined />
              Quản lý Giảm giá
            </h1>
            <p className="text-gray-500 text-sm">Quản lý chiết khấu tự động cho sản phẩm</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Thêm Discount
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <Table
            columns={columns}
            dataSource={discounts}
            loading={loading}
            rowKey="_id"
            scroll={{ x: 1400 }}
            pagination={{ pageSize: 10 }}
          />
        </div>
      </div>

      <Modal
        title={
          <div className="text-xl font-bold">
            {editingDiscount ? "✏️ Sửa Discount" : "➕ Thêm Discount"}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
        okText={editingDiscount ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Tên Discount"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input placeholder="VD: Giảm giá mùa hè 2024" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea
              rows={2}
              placeholder="Mô tả ngắn gọn về discount này..."
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            name="terms"
            label="Điều khoản"
          >
            <Input.TextArea
              rows={2}
              placeholder="Điều khoản áp dụng (nếu có)..."
              maxLength={500}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="discountType"
              label="Loại Discount"
              rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
              initialValue={DISCOUNT_TYPES.GLOBAL}
            >
              <Select
                placeholder="Chọn loại discount"
                onChange={handleDiscountTypeChange}
              >
                <Option value={DISCOUNT_TYPES.GLOBAL}>🌍 Toàn bộ sản phẩm</Option>
                <Option value={DISCOUNT_TYPES.CATEGORY}>📁 Theo danh mục</Option>
                <Option value={DISCOUNT_TYPES.BRAND}>🏷️ Theo thương hiệu</Option>
                <Option value={DISCOUNT_TYPES.PRODUCT}>📦 Sản phẩm cụ thể</Option>
                <Option value={DISCOUNT_TYPES.PRODUCT_LIST}>📋 Nhiều sản phẩm</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="percentage"
              label="Phần trăm giảm (%)"
              rules={[
                { required: true, message: 'Vui lòng nhập phần trăm' },
                { type: 'number', min: 0, max: 100, message: 'Giá trị từ 0-100' }
              ]}
            >
              <InputNumber
                min={0}
                max={100}
                className="w-full"
                placeholder="Nhập phần trăm giảm"
              />
            </Form.Item>
          </div>

          {/* Conditional fields based on discount type */}
          {selectedType === DISCOUNT_TYPES.PRODUCT && (
            <Form.Item
              name="product"
              label="Chọn sản phẩm"
              rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
            >
              <Select
                showSearch
                placeholder="Chọn sản phẩm"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {products.map(product => (
                  <Option key={product._id} value={product._id}>
                    {product.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {selectedType === DISCOUNT_TYPES.BRAND && (
            <Form.Item
              name="brand"
              label="Chọn thương hiệu"
              rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
            >
              <Select placeholder="Chọn thương hiệu">
                {brands.map(brand => (
                  <Option key={brand._id} value={brand._id}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {selectedType === DISCOUNT_TYPES.CATEGORY && (
            <Form.Item
              name="category"
              label="Chọn danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select placeholder="Chọn danh mục">
                {categories.map(category => (
                  <Option key={category._id} value={category._id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {selectedType === DISCOUNT_TYPES.PRODUCT_LIST && (
            <Form.Item
              name="products"
              label="Chọn nhiều sản phẩm"
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất một sản phẩm' }]}
            >
              <Select
                mode="multiple"
                showSearch
                placeholder="Chọn sản phẩm (nhiều lựa chọn)"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {products.map(product => (
                  <Option key={product._id} value={product._id}>
                    {product.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="priority"
              label="Độ ưu tiên"
              tooltip="Số nhỏ = ưu tiên cao. Mặc định: PRODUCT=1, PRODUCT_LIST=2, BRAND=3, CATEGORY=4, GLOBAL=5"
            >
              <InputNumber
                min={1}
                className="w-full"
                placeholder="Để trống = tự động"
              />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Trạng thái"
              initialValue={true}
            >
              <Select>
                <Option value={true}>
                  <Tag color="green">Hoạt động</Tag>
                </Option>
                <Option value={false}>
                  <Tag color="default">Tạm tắt</Tag>
                </Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              initialValue={moment()}
            >
              <DatePicker
                showTime
                className="w-full"
                format="DD/MM/YYYY HH:mm"
                placeholder="Chọn ngày giờ"
              />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="Ngày kết thúc (tùy chọn)"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('startDate')) {
                      return Promise.resolve();
                    }
                    if (value.isAfter(getFieldValue('startDate'))) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                  },
                }),
              ]}
            >
              <DatePicker
                showTime
                className="w-full"
                format="DD/MM/YYYY HH:mm"
                placeholder="Để trống = không giới hạn"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagerDiscount;
