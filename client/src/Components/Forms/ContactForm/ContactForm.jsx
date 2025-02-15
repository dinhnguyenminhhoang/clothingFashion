import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createNewReport } from "../../../service/reportService";
import useNotification from "../../../hooks/NotiHook";
import { message } from "antd";

// schema
const schema = Yup.object().shape({
  name: Yup.string().required("Tên không được để trống").label("Tên"),
  phone: Yup.string()
    .required("Số điện thoại không được để trống")
    .label("Số điện thoại"),
  email: Yup.string()
    .required("Email không được để trống")
    .email("Email không hợp lệ")
    .label("Email"),
  title: Yup.string().required("Chủ đề không được để trống").label("Chủ đề"),
  content: Yup.string()
    .required("Nội dung không được để trống")
    .label("Nội dung"),
  remember: Yup.bool()
    .oneOf([true], "Bạn cần đồng ý với các điều khoản để tiếp tục.")
    .label("Điều khoản"),
});

const ContactForm = () => {
  const initialValues = {
    name: "",
    email: "",
    title: "",
    content: "",
    phone: "",
    remember: false,
  };

  const onSubmit = async (data, { resetForm }) => {
    try {
      const res = await createNewReport(data);
      if (res) {
        message.success("Đã ghi nhận báo cáo");
        resetForm();
      }
    } catch (error) {
      message.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={onSubmit}
    >
      {() => (
        <Form id="contact-form" className="max-w-lg mx-auto">
          <div className="space-y-1">
            <div>
              <label
                htmlFor="name"
                className="text-start block text-sm font-medium text-gray-700"
              >
                Tên
              </label>
              <Field
                name="name"
                type="text"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Nhập tên của bạn"
              />
              <ErrorMessage
                name="name"
                component="p"
                className="text-red-500 text-xs text-start"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-start block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <Field
                name="email"
                type="email"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Nhập email của bạn"
              />
              <ErrorMessage
                name="email"
                component="p"
                className="text-red-500 text-xs text-start"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="text-start block text-sm font-medium text-gray-700"
              >
                Số điện thoại
              </label>
              <Field
                name="phone"
                type="phone"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Nhập Số điện thoại của bạn"
              />
              <ErrorMessage
                name="phone"
                component="p"
                className="text-red-500 text-xs text-start"
              />
            </div>

            <div>
              <label
                htmlFor="title"
                className="text-start block text-sm font-medium text-gray-700"
              >
                Chủ đề
              </label>
              <Field
                name="title"
                type="text"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Nhập chủ đề"
              />
              <ErrorMessage
                name="title"
                component="p"
                className="text-red-500 text-xs text-start"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="text-start block text-sm font-medium text-gray-700"
              >
                Nội dung
              </label>
              <Field
                name="content"
                as="textarea"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Nhập nội dung của bạn"
              />
              <ErrorMessage
                name="content"
                component="p"
                className="text-red-500 text-xs text-start"
              />
            </div>

            <div className="flex items-center">
              <Field
                name="remember"
                type="checkbox"
                className="h-4 w-4 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Tôi đồng ý với các điều khoản
              </label>
              <ErrorMessage
                name="remember"
                component="p"
                className="text-red-500 text-xs text-start"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                Gửi tin nhắn
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ContactForm;
