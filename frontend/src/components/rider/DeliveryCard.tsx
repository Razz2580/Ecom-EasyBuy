import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPinned, CheckCircle, Navigation, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeliveryStatus } from '@/types';
import type { Delivery } from '@/types';

interface DeliveryCardProps {
  delivery: Delivery;
  type: 'available' | 'active' | 'completed';
  onAccept?: () => void;
  onUpdateStatus?: (deliveryId: number, status: string) => void;
}

const statusConfig: Record<string, { label: string; color: string; nextStatus?: string; nextLabel?: string }> = {
  [DeliveryStatus.REQUESTED]: { 
    label: 'Available', 
    color: 'bg-blue-500',
    nextStatus: DeliveryStatus.ACCEPTED,
    nextLabel: 'Accept'
  },
  [DeliveryStatus.ACCEPTED]: { 
    label: 'Accepted', 
    color: 'bg-indigo-500',
    nextStatus: DeliveryStatus.AT_SELLER,
    nextLabel: 'Arrived at Seller'
  },
  [DeliveryStatus.AT_SELLER]: { 
    label: 'At Seller', 
    color: 'bg-purple-500',
    nextStatus: DeliveryStatus.PICKED_UP,
    nextLabel: 'Picked Up'
  },
  [DeliveryStatus.PICKED_UP]: { 
    label: 'Picked Up', 
    color: 'bg-orange-500',
    nextStatus: DeliveryStatus.DELIVERED,
    nextLabel: 'Delivered'
  },
  [DeliveryStatus.DELIVERED]: { 
    label: 'Delivered', 
    color: 'bg-green-500' 
  },
};

export default function DeliveryCard({ delivery, type, onAccept, onUpdateStatus }: DeliveryCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const status = statusConfig[delivery.status] || { label: delivery.status, color: 'bg-gray-500' };

  const handleAction = async () => {
    if (!status.nextStatus || !onUpdateStatus) return;
    setIsProcessing(true);
    await onUpdateStatus(delivery.id, status.nextStatus);
    setIsProcessing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Order #{delivery.orderId}</h4>
                <Badge className={`${status.color} text-white mt-1`}>
                  {status.label}
                </Badge>
              </div>
            </div>
            {delivery.distance !== undefined && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Distance</p>
                <p className="font-semibold text-blue-600">{delivery.distance.toFixed(1)} km</p>
              </div>
            )}
          </div>

          {/* Pickup Location */}
          <div className="bg-gray-50 p-3 rounded-lg mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <Store className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Pickup Location</span>
            </div>
            {delivery.pickupLatitude && delivery.pickupLongitude ? (
              <div className="text-sm text-gray-600 pl-6">
                {delivery.pickupLatitude.toFixed(4)}, {delivery.pickupLongitude.toFixed(4)}
              </div>
            ) : (
              <div className="text-sm text-gray-400 pl-6">Location not specified</div>
            )}
          </div>

          {/* Drop Location */}
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <MapPinned className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">Drop-off Location</span>
            </div>
            {delivery.dropLatitude && delivery.dropLongitude ? (
              <div className="text-sm text-blue-600 pl-6">
                {delivery.dropLatitude.toFixed(4)}, {delivery.dropLongitude.toFixed(4)}
              </div>
            ) : (
              <div className="text-sm text-blue-400 pl-6">Location not specified</div>
            )}
          </div>

          {/* Actions */}
          {type === 'available' && onAccept && (
            <Button
              onClick={onAccept}
              className="w-full"
              disabled={isProcessing}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Accept Delivery
            </Button>
          )}

          {type === 'active' && status.nextStatus && onUpdateStatus && (
            <Button
              onClick={handleAction}
              className="w-full"
              disabled={isProcessing}
              variant={delivery.status === DeliveryStatus.PICKED_UP ? 'default' : 'outline'}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isProcessing ? 'Updating...' : status.nextLabel}
            </Button>
          )}

          {type === 'completed' && (
            <div className="flex items-center justify-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Delivery Completed</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
