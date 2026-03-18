import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, CheckCircle, XCircle, User, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderStatus } from '@/types';
import type { Order } from '@/types';
import { apiService } from '@/services';

interface SellerOrderCardProps {
  order: Order;
  onUpdate: () => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  [OrderStatus.PENDING]: { label: 'Pending', color: 'bg-yellow-500' },
  [OrderStatus.ACCEPTED]: { label: 'Accepted', color: 'bg-blue-500' },
  [OrderStatus.SELLER_DELIVERING]: { label: 'Delivering', color: 'bg-purple-500' },
  [OrderStatus.RIDER_ASSIGNED]: { label: 'Rider Assigned', color: 'bg-indigo-500' },
  [OrderStatus.PICKED_UP]: { label: 'Picked Up', color: 'bg-orange-500' },
  [OrderStatus.DELIVERED]: { label: 'Delivered', color: 'bg-green-500' },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', color: 'bg-red-500' },
};

export default function SellerOrderCard({ order, onUpdate }: SellerOrderCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const status = statusConfig[order.status] || { label: order.status, color: 'bg-gray-500' };

  const handleAccept = async () => {
    try {
      setIsProcessing(true);
      await apiService.acceptOrder(order.id);
      onUpdate();
    } catch (error) {
      console.error('Error accepting order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!confirm('Are you sure you want to decline this order?')) return;
    try {
      setIsProcessing(true);
      await apiService.declineOrder(order.id);
      onUpdate();
    } catch (error) {
      console.error('Error declining order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                {order.productImage ? (
                  <img
                    src={order.productImage}
                    alt={order.productName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Package className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{order.productName}</h4>
                <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                <p className="text-sm font-medium text-blue-600">${order.totalPrice.toFixed(2)}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <User className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{order.customerName}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${status.color} text-white`}>{status.label}</Badge>
              <p className="text-xs text-gray-400 mt-1">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>

          {order.deliveryAddress && (
            <div className="mt-3 flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1 text-gray-400" />
              {order.deliveryAddress}
            </div>
          )}

          {order.status === OrderStatus.PENDING && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 flex space-x-2"
            >
              <Button
                onClick={handleAccept}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button
                onClick={handleDecline}
                disabled={isProcessing}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </motion.div>
          )}

          {order.rider && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Assigned Rider: {order.rider.riderName}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Phone className="w-3 h-3 text-blue-700" />
                <span className="text-xs text-blue-700">{order.rider.riderPhone}</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {order.rider.vehicleType} • {order.rider.vehicleNumber}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
