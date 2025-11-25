import { EyeOutlined, StarOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  message,
  Modal,
  Rate,
  Row,
  Table,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";
import { MdCancel } from "react-icons/md";
import { getOrderByUser, userUpdateStatus } from "../../service/orderService";
import { createReview } from "../../service/reviewService";
import { formatCurrencyVND } from "../../utils";
import { IMAGEURL } from "../../utils/constant";
import OrderDetail from "../../Components/OrderDetail/OrderDetail";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const fetchData = async () => {
    const res = await getOrderByUser();
    if (res.status === 200) {
      setOrders(res.data);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Tên người nhận",
      dataIndex: "recipientName",
      key: "recipientName",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Số điện thoại nhận hàng",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Tổng tiền",
      key: "amount",
      render: (_, record) => (
        <div>
          <div className="font-bold text-green-600">
            {formatCurrencyVND(record.finalAmount || record.totalAmount)}
          </div>
          {record.voucher?.code && (
            <div className="text-xs text-gray-500">
              <Tag color="red" className="mt-1">{record.voucher.code}</Tag>
              <div>Giảm: {formatCurrencyVND(record.voucher.discount)}</div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (text) =>
        text === "cash" ? "Thanh toán khi nhận hàng" : "Thanh toán qua thẻ",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusLabels = {
          pending: "Đang chờ xử lý",
          cancel: "Đã hủy",
          processing: "Đang xử lý",
          delivered: "Đã giao hàng",
          vnpay: "Đã thanh toán qua vnpay",
        };

        return (
          <Tag
            color={
              status === "pending"
                ? "orange"
                : status === "cancel"
                  ? "red"
                  : "green"
            }
          >
            {statusLabels[status] || "Không xác định"}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => viewDetails(record)}
          >
            Xem chi tiết
          </Button>
          {record.status === "delivered" ? (
            record.isRating ? (
              <Button
                type="default"
                className="bg-yellow-500 text-white"
                icon={<StarOutlined />}
                onClick={() => openReviewModal(record)}
              >
                Đánh giá
              </Button>
            ) : (
              <Button
                type="default"
                className="bg-yellow-500 text-white"
                icon={<StarOutlined />}
                disabled
              >
                Bạn đã đánh giá
              </Button>
            )
          ) : null}
          {record.status === "pending" ? (
            <Button
              type="default"
              danger
              icon={<MdCancel />}
              onClick={() => handleCancelOrder(record)}
            >
              Hủy đơn
            </Button>
          ) : null}
          {record.status === "cancel" ? (
            <Button type="default" danger icon={<MdCancel />} disabled>
              Đơn hàng đã hủy
            </Button>
          ) : null}
        </div>
      ),
    },
  ];
  const handleCancelOrder = (record) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn hủy đơn?",
      content: "Hành động này sẽ không thể hoàn tác.",
      okText: "Xác nhận",
      cancelText: "Quay lại",
      onOk: async () => {
        try {
          await userUpdateStatus({ status: "cancel" }, record._id);
          message.success("Đơn hàng đã được hủy thành công");
          fetchData();
        } catch (error) {
          message.error("Có lỗi xảy ra khi hủy đơn");
        }
      },
    });
  };
  const openReviewModal = (order) => {
    setSelectedOrder(order);
    setIsReviewModalVisible(true);
  };
  const submitReview = async () => {
    if (!reviewRating || !reviewText.trim()) {
      return message.warning("Vui lòng nhập đầy đủ thông tin đánh giá!");
    }

    try {
      const reviewPromises = selectedOrder?.cart?.map((element) =>
        createReview({
          product: element.product._id,
          rating: reviewRating,
          comment: reviewText,
          orderId: selectedOrder._id,
        })
      );

      await Promise.all(reviewPromises);

      message.success("Đánh giá sản phẩm thành công");
      fetchData();
      setIsReviewModalVisible(false);
      setReviewRating(0);
      setReviewText("");
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
        "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!"
      );
    }
  };

  const viewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };
  const calculateTotal = () => {
    const totalProductPrice = selectedOrder?.cart?.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
    return totalProductPrice;
  };
  const isMobile = useIsMobile();

  const statusLabels = {
    pending: "Đang chờ xử lý",
    cancel: "Đã hủy",
    processing: "Đang xử lý",
    delivered: "Đã giao hàng",
    vnpay: "Đã thanh toán qua vnpay",
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "orange";
      case "cancel": return "red";
      case "delivered": return "green";
      case "processing": return "blue";
      default: return "default";
    }
  };

  // Mobile Order Card Component
  const MobileOrderCard = ({ order }) => {
    const firstItem = order.cart?.[0];
    const otherItemsCount = order.cart?.length - 1;

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-3">
        {/* Header: Shop Name & Status */}
        <div className="flex justify-between items-center border-b pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">Nova Fashion</span>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${order.status === 'cancel' ? 'bg-red-100 text-red-600' :
            order.status === 'delivered' ? 'bg-green-100 text-green-600' :
              'bg-orange-100 text-orange-600'
            }`}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>

        {/* Product Preview */}
        <div className="flex gap-3 mb-3" onClick={() => viewDetails(order)}>
          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            {firstItem?.product?.img ? (
              <img
                src={`${IMAGEURL}${firstItem.product.img}`}
                alt={firstItem.product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">IMG</div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium line-clamp-1">{firstItem?.product?.title}</h4>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">x{firstItem?.quantity}</span>
              {otherItemsCount > 0 && (
                <span className="text-xs text-gray-400">+{otherItemsCount} sản phẩm khác</span>
              )}
            </div>
            <div className="text-right mt-1">
              <span className="text-red-500 font-bold">{formatCurrencyVND(firstItem?.product?.salePrice || firstItem?.product?.price)}</span>
            </div>
          </div>
        </div>

        {/* Total & Actions */}
        <div className="border-t pt-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">{order.cart?.length} sản phẩm</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">Thành tiền:</span>
              <span className="text-base font-bold text-red-600">{formatCurrencyVND(order.finalAmount || order.totalAmount)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {order.status === "pending" && (
              <Button
                danger
                size="middle"
                onClick={() => handleCancelOrder(order)}
                className="flex-1"
              >
                Hủy đơn
              </Button>
            )}

            {order.status === "delivered" && (
              <Button
                type="default"
                className="bg-yellow-500 text-white border-none flex-1"
                onClick={() => order.isRating ? null : openReviewModal(order)}
                disabled={order.isRating}
              >
                {order.isRating ? "Đã đánh giá" : "Đánh giá"}
              </Button>
            )}

            <Button
              type="primary" // Changed to primary for better visibility
              onClick={() => viewDetails(order)}
              className="flex-1"
            >
              Xem chi tiết
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6 md:mb-8 text-gray-800">
        Lịch sử đơn hàng
      </h1>
      {orders?.length ? (
        <>
          {isMobile ? (
            <div className="space-y-3">
              {orders.map(order => (
                <MobileOrderCard key={order._id} order={order} />
              ))}
            </div>
          ) : (
            <Card className="shadow-xl rounded-xl bg-white">
              <Table
                columns={columns}
                dataSource={orders}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
                bordered
              />
            </Card>
          )}

          <OrderDetail
            selectedOrder={selectedOrder}
            isModalVisible={isModalVisible}
            handleCancel={handleCancel}
          />
          <Modal
            title="Đánh giá đơn hàng"
            visible={isReviewModalVisible}
            onCancel={() => setIsReviewModalVisible(false)}
            footer={null}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Đánh giá (1-5 sao):</h3>
                <Rate
                  allowHalf
                  value={reviewRating}
                  onChange={(value) => setReviewRating(value)}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Nhận xét:</h3>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={4}
                  placeholder="Nhập nhận xét của bạn"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button type="primary" onClick={submitReview}>
                  Gửi đánh giá
                </Button>
              </div>
            </div>
          </Modal>
        </>
      ) : (
        <span className="flex items-center justify-center font-bold text-xl text-gray-500 py-10">
          Chưa có đơn hàng nào
        </span>
      )}
    </div>
  );
};

// Custom hook to detect mobile (copied for local usage or could be imported if shared)
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

export default OrderHistory;
