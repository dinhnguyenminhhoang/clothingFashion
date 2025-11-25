import React from 'react';
import { Steps, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import moment from 'moment';

const OrderTimeline = ({ order }) => {
  if (!order) return null;

  const statusConfig = {
    pending: {
      title: 'Đơn hàng đã đặt',
      icon: <ClockCircleOutlined />,
      color: 'orange'
    },
    processing: {
      title: 'Đang xử lý',
      icon: <SyncOutlined spin />,
      color: 'blue'
    },
    delivered: {
      title: 'Đã giao hàng',
      icon: <CheckCircleOutlined />,
      color: 'green'
    },
    cancel: {
      title: 'Đã hủy',
      icon: <CloseCircleOutlined />,
      color: 'red'
    }
  };

  // Determine current step index
  const getCurrentStep = () => {
    const statusOrder = ['pending', 'processing', 'delivered'];
    return statusOrder.indexOf(order.status);
  };

  // Check if order is cancelled
  if (order.status === 'cancel') {
    const cancelInfo = order.statusHistory?.find(h => h.status === 'cancel');
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Tiến độ đơn hàng</h3>
        <div className="text-center py-8">
          <CloseCircleOutlined className="text-6xl text-red-500 mb-4" />
          <h4 className="text-2xl font-semibold text-red-600 mb-2">Đơn hàng đã bị hủy</h4>
          <p className="text-gray-600">
            {moment(cancelInfo?.timestamp || order.updatedAt).format('DD/MM/YYYY HH:mm')}
          </p>
          {cancelInfo?.note && (
            <p className="text-gray-500 mt-2 italic">"{cancelInfo.note}"</p>
          )}
        </div>
      </div>
    );
  }

  // Get timestamps for each status
  const getStatusTimestamp = (status) => {
    const statusEntry = order.statusHistory?.find(h => h.status === status);
    return statusEntry ? moment(statusEntry.timestamp).format('DD/MM/YYYY HH:mm') : null;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold mb-6 text-gray-800">Tiến độ đơn hàng</h3>
      
      {/* Main Timeline Steps */}
      <Steps
        current={getCurrentStep()}
        status="process"
        className="mb-8"
        items={[
          {
            title: <span className="font-semibold">Đơn hàng đã đặt</span>,
            description: getStatusTimestamp('pending') || moment(order.createdAt).format('DD/MM/YYYY HH:mm'),
            icon: <CheckCircleOutlined className="text-xl" />,
          },
          {
            title: <span className="font-semibold">Đang xử lý</span>,
            description: getStatusTimestamp('processing') || (getCurrentStep() >= 1 ? 'Đang xử lý...' : 'Chờ xử lý'),
            icon: getCurrentStep() >= 1 ? (
              getCurrentStep() === 1 ? <SyncOutlined spin className="text-xl" /> : <CheckCircleOutlined className="text-xl" />
            ) : (
              <ClockCircleOutlined className="text-xl text-gray-400" />
            ),
          },
          {
            title: <span className="font-semibold">Đã giao hàng</span>,
            description: getStatusTimestamp('delivered') || (
              order.estimatedDelivery 
                ? `Dự kiến: ${moment(order.estimatedDelivery).format('DD/MM/YYYY')}`
                : 'Chờ giao hàng'
            ),
            icon: getCurrentStep() >= 2 ? (
              <CheckCircleOutlined className="text-xl" />
            ) : (
              <ClockCircleOutlined className="text-xl text-gray-400" />
            ),
          }
        ]}
      />

      {/* Estimated Delivery Info */}
      {order.status !== 'delivered' && order.estimatedDelivery && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <ClockCircleOutlined className="text-blue-600" />
            <span className="font-semibold text-blue-800">Thời gian giao hàng dự kiến:</span>
            <span className="text-blue-700">{moment(order.estimatedDelivery).format('DD/MM/YYYY')}</span>
          </div>
        </div>
      )}

      {/* Detailed Timeline */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="mt-8">
          <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded"></span>
            Lịch sử cập nhật
          </h4>
          <div className="space-y-3">
            {order.statusHistory.slice().reverse().map((item, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  index === 0 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`mt-1 text-${statusConfig[item.status]?.color}-500 text-xl`}>
                  {statusConfig[item.status]?.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {statusConfig[item.status]?.title}
                    </span>
                    {index === 0 && (
                      <Tag color="blue" className="text-xs">Mới nhất</Tag>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {moment(item.timestamp).format('DD/MM/YYYY HH:mm')}
                  </div>
                  {item.note && (
                    <div className="text-sm text-gray-700 mt-2 italic">
                      "{item.note}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
