import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ShoppingCart, Bell, LogOut, Star, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { apiService, webSocketService } from '@/services';
import { OrderStatus } from '@/types';
import type { Product, Order, Notification } from '@/types';
import ProductCard from '@/components/customer/ProductCard';
import OrderCard from '@/components/customer/OrderCard';
import ProductDetail from '@/components/customer/ProductDetail';
import NotificationPanel from '@/components/common/NotificationPanel';
import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => console.error('Error getting location:', error)
      );
    }

    loadData();
    setupWebSocket();

    return () => {
      webSocketService.unsubscribe('orders');
      webSocketService.unsubscribe('notifications');
    };
  }, []);

  useEffect(() => {
    if (location) loadNearbyProducts();
  }, [location]);

  const setupWebSocket = () => {
    webSocketService.subscribe('orders', (orderUpdate) => {
      setOrders((prev) => prev.map((o) => (o.id === orderUpdate.id ? { ...o, ...orderUpdate } : o)));
    });
    webSocketService.subscribe('notifications', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ordersData, notificationsData, unreadData] = await Promise.all([
        apiService.getCustomerOrders(),
        apiService.getNotifications(),
        apiService.getUnreadCount(),
      ]);
      setOrders(ordersData);
      setNotifications(notificationsData);
      setUnreadCount(unreadData.count);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNearbyProducts = async () => {
    if (!location) return;
    try {
      const data = await apiService.getNearbyProducts(location.lat, location.lng, 10);
      setProducts(data);
    } catch (error) {
      console.error('Error loading nearby products:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadNearbyProducts();
      return;
    }
    try {
      const data = await apiService.searchProducts(searchQuery);
      setProducts(data);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handlePlaceOrder = async (productId: number, quantity: number, deliveryAddress: string) => {
    try {
      const orderData: any = { productId, quantity, deliveryAddress };
      if (location) {
        orderData.customerLatitude = location.lat;
        orderData.customerLongitude = location.lng;
      }
      await apiService.createOrder(orderData);
      loadData();
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const handleMarkNotificationRead = async (id: number) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

const activeOrders = orders.filter((o) =>
  [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.SELLER_DELIVERING, OrderStatus.RIDER_ASSIGNED, OrderStatus.PICKED_UP].includes(o.status)
) as Order[];

const orderHistory = orders.filter((o) =>
  [OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(o.status)
) as Order[];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3"
              >
                <ShoppingCart className="w-5 h-5 text-white" />
              </motion.div>
              <h1 className="text-xl font-bold text-gray-900">EasyBuy</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-64"
                />
                <Button size="icon" variant="ghost" onClick={handleSearch}>
                  <Search className="w-5 h-5" />
                </Button>
              </div>

              <div className="relative">
                <Button size="icon" variant="ghost" onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                <AnimatePresence>
                  {showNotifications && (
                    <NotificationPanel
                      notifications={notifications}
                      onClose={() => setShowNotifications(false)}
                      onMarkRead={handleMarkNotificationRead}
                    />
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center space-x-2">
                <Link to="/profile">
                  <span className="hidden sm:block text-sm font-medium cursor-pointer hover:text-blue-600">
                    {user?.fullName}
                  </span>
                </Link>
              </div>

              <Button size="icon" variant="ghost" onClick={logout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="browse"><Search className="w-4 h-4 mr-2" /> Browse</TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="w-4 h-4 mr-2" /> My Orders
              {activeOrders.length > 0 && <Badge className="ml-2 bg-blue-500">{activeOrders.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="history"><Star className="w-4 h-4 mr-2" /> History</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {location && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg"
              >
                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                Showing products near your location
              </motion.div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg" />
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} onClick={() => setSelectedProduct(product)} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No products found nearby</p>
                  <Button onClick={loadNearbyProducts} className="mt-4">Refresh</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {activeOrders.length > 0 ? (
              activeOrders.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No active orders</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {orderHistory.length > 0 ? (
              orderHistory.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Star className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No order history</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          {selectedProduct && (
            <ProductDetail
              product={selectedProduct}
              onPlaceOrder={handlePlaceOrder}
              onClose={() => setSelectedProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
