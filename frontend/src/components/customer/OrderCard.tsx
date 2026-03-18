import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, CheckCircle, XCircle, Truck, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderStatus } from '@/types';
import type { Order } from '@/types';
import { apiService } from '@/services';

interface OrderCardProps {
  order: Order;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  [OrderStatus.PENDING]: { label: 'Pending', color: 'bg-yellow-500', icon: null },
  [OrderStatus.ACCEPTED]: { label: 'Accepted', color: 'bg-blue-500', icon: CheckCircle },
  [OrderStatus.SELLER_DELIVERING]: { label: 'Seller Delivering', color: 'bg-purple-500', icon: Truck },
  [OrderStatus.RIDER_ASSIGNED]: { label: 'Rider Assigned', color: 'bg-indigo-500', icon: User },
  [OrderStatus.PICKED_UP]: { label: 'Picked Up', color: 'bg-orange-500', icon: Truck },
  [OrderStatus.DELIVERED]: { label: 'Delivered', color: 'bg-green-500', icon: CheckCircle },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

export default function OrderCard({ order }: OrderCardProps) {
  const [isRequestingRider, setIsRequestingRider] = useState(false);
  const status = statusConfig[order.status] || { label: order.status, color: 'bg-gray-500', icon: null };
  const StatusIcon = status.icon;

  const handleRequestRider = async () => {
    try {
      setIsRequestingRider(true);
      await apiService.requestRiderDelivery(order.id);
      window.location.reload();
    } catch (error) {
      console.error('Error requesting rider:', error);
    } finally {
      setIsRequestingRider(false);
    }
  };

  const showRequestRider = order.status === OrderStatus.ACCEPTED && !order.deliveryMethod;

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
                  <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Package className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{order.productName}</h4>
                <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                <p className="text-sm font-medium text-blue-600">${order.totalPrice.toFixed(2)}</p>
                {order.seller && (
                  <p className="text-xs text-gray-400 mt-1">{order.seller.storeName}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${status.color} text-white`}>
                {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
                {status.label}
              </Badge>
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

          {order.rider && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Rider: {order.rider.riderName}</p>
              <p className="text-xs text-blue-700">{order.rider.vehicleType} • {order.rider.vehicleNumber}</p>
            </div>
          )}

          {showRequestRider && (
            <div className="mt-3">
              <Button
                onClick={handleRequestRider}
                disabled={isRequestingRider}
                className="w-full"
                variant="outline"
              >
                {isRequestingRider ? 'Requesting...' : 'Request Rider Delivery'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
