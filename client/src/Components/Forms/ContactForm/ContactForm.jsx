import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

// schema
const schema = Yup.object().shape({
  name: Yup.string().required("Tên không được để trống").label("Tên"),
  email: Yup.string()
    .required("Email không được để trống")
    .email("Email không hợp lệ")
    .label("Email"),
  subject: Yup.string().required("Chủ đề không được để trống").label("Chủ đề"),
  message: Yup.string()
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
    subject: "",
    message: "",
    remember: false,
  };

  const onSubmit = (data, { resetForm }) => {
    alert("Gửi tin nhắn thành công!");
    resetForm();
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
                className="text-red-500 text-xs"
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
                className="text-red-500 text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="text-start block text-sm font-medium text-gray-700"
              >
                Chủ đề
              </label>
              <Field
                name="subject"
                type="text"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Nhập chủ đề"
              />
              <ErrorMessage
                name="subject"
                component="p"
                className="text-red-500 text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="text-start block text-sm font-medium text-gray-700"
              >
                Nội dung
              </label>
              <Field
                name="message"
                as="textarea"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Nhập nội dung của bạn"
              />
              <ErrorMessage
                name="message"
                component="p"
                className="text-red-500 text-xs"
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
                className="text-red-500 text-xs"
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
