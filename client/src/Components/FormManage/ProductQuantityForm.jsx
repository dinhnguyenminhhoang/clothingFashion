import { Button, Form, Input, InputNumber } from "antd";
import React, { useEffect } from "react";

const ProductQuantityForm = ({ initialValues, onSave, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues]);

  const handleFinish = (values) => {
    onSave(values);
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical">
      {/* Số lượng nhập vào */}
      <Form.Item
        name="quantity"
        label="Số lượng"
        rules={[
          {
            required: true,
            message: "Vui lòng nhập số lượng!",
          },
          {
            type: "number",
            min: 0,
            message: "Số lượng phải là một số dương hoặc bằng 0!",
          },
        ]}
        style={{ width: "100%" }} // Đảm bảo input chiếm hết chiều ngang
      >
        <InputNumber
          placeholder="Nhập số lượng"
          min={0}
          style={{ width: "100%" }}
        />
      </Form.Item>

      {/* Ghi chú */}
      <Form.Item
        name="note"
        label="Ghi chú"
        rules={[
          {
            required: false,
            message: "Vui lòng nhập ghi chú nếu cần!",
          },
        ]}
        style={{ width: "100%" }} // Đảm bảo input chiếm hết chiều ngang
      >
        <Input placeholder="Nhập ghi chú (nếu có)" style={{ width: "100%" }} />
      </Form.Item>

      {/* Giá gốc */}
      <Form.Item
        name="originPrice"
        label="Giá gốc"
        rules={[
          {
            required: true,
            message: "Vui lòng nhập giá gốc!",
          },
          {
            type: "number",
            min: 0,
            message: "Giá gốc phải là một số dương!",
          },
        ]}
        style={{ width: "100%" }} // Đảm bảo input chiếm hết chiều ngang
      >
        <InputNumber
          placeholder="Nhập giá gốc"
          min={0}
          style={{ width: "100%" }}
        />
      </Form.Item>

      {/* Lưu và hủy */}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
        <Button onClick={onCancel} style={{ marginLeft: "8px" }}>
          Cancel
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProductQuantityForm;
