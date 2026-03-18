import { motion } from 'framer-motion';
import { MapPin, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
        onClick={onClick}
      >
        <div className="relative h-48 bg-gray-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-300" />
            </div>
          )}
          {product.distance !== undefined && (
            <Badge className="absolute top-2 right-2 bg-blue-500">
              <MapPin className="w-3 h-3 mr-1" />
              {product.distance.toFixed(1)} km
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.storeName}</p>
            </div>
            <span className="font-bold text-blue-600">${product.price.toFixed(2)}</span>
          </div>
          {product.category && (
            <Badge variant="secondary" className="mt-2">
              {product.category}
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
