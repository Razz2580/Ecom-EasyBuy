import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Store, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/types';

interface ProductDetailProps {
  product: Product;
  onPlaceOrder: (productId: number, quantity: number, deliveryAddress: string) => void;
  onClose: () => void;
}

export default function ProductDetail({ product, onPlaceOrder, onClose }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!deliveryAddress.trim()) return;
    setIsSubmitting(true);
    await onPlaceOrder(product.id, quantity, deliveryAddress);
    setIsSubmitting(false);
  };

  const totalPrice = product.price * quantity;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
          {product.category && (
            <Badge variant="secondary" className="mt-2">
              {product.category}
            </Badge>
          )}
        </div>
        <Button size="icon" variant="ghost" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <ShoppingBag className="w-24 h-24 text-gray-300" />
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900">Description</h3>
            <p className="text-gray-600 mt-1">{product.description || 'No description available'}</p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Store className="w-4 h-4" />
            <span>{product.storeName}</span>
          </div>

          {product.distance !== undefined && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{product.distance.toFixed(1)} km away</span>
            </div>
          )}

          <Separator />

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center space-x-3 mt-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-500">({product.stock} available)</span>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Delivery Address *</Label>
            <Input
              id="address"
              placeholder="Enter your delivery address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-blue-600">${totalPrice.toFixed(2)}</p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!deliveryAddress.trim() || isSubmitting}
              className="px-8"
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
