import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Package, ShoppingCart, Plus, MapPin, Bell, LogOut, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { apiService, webSocketService } from '@/services';
import { OrderStatus } from '@/types';
import type { Product, Order, Notification, Seller } from '@/types';
import ProductForm from '@/components/seller/ProductForm';
import SellerOrderCard from '@/components/seller/SellerOrderCard';
import NotificationPanel from '@/components/common/NotificationPanel';

export default function SellerDashboard() {
  const { user, logout } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    setupWebSocket();

    return () => {
      webSocketService.unsubscribe('orders');
      webSocketService.unsubscribe('notifications');
    };
  }, []);

  const setupWebSocket = () => {
    webSocketService.subscribe('orders', (orderUpdate) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderUpdate.id ? { ...o, ...orderUpdate } : o))
      );
    });

    webSocketService.subscribe('notifications', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sellerData, productsData, ordersData, notificationsData, unreadData] = await Promise.all([
        apiService.getSellerProfile(),
        apiService.getSellerProfile().then(s => apiService.getProductsBySeller(s.id)),
        apiService.getSellerOrders(),
        apiService.getNotifications(),
        apiService.getUnreadCount(),
      ]);
      setSeller(sellerData);
      setProducts(productsData);
      setOrders(ordersData);
      setNotifications(notificationsData);
      setUnreadCount(unreadData.count);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, productData);
      } else {
        await apiService.createProduct(productData);
      }
      loadData();
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiService.deleteProduct(productId);
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleUpdateLocation = async () => {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await apiService.updateSellerLocation(
            position.coords.latitude,
            position.coords.longitude
          );
          loadData();
        } catch (error) {
          console.error('Error updating location:', error);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
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

  const pendingOrders = orders.filter((o) => o.status === OrderStatus.PENDING);
  const totalRevenue = orders
    .filter((o) => o.status === OrderStatus.DELIVERED)
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3"
              >
                <Store className="w-5 h-5 text-white" />
              </motion.div>
             <div>
              <Link to="/profile">
                <h1 className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600">
                    {user?.fullName || 'My Store'}
                </h1>
              </Link>
              <p className="text-xs text-gray-500">Seller Dashboard</p>
              </div>
         </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
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

              <Button size="icon" variant="ghost" onClick={logout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Update */}
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {seller?.latitude && seller?.longitude
                  ? `Location: ${seller.latitude.toFixed(4)}, ${seller.longitude.toFixed(4)}`
                  : 'Location not set'}
              </span>
            </div>
            <Button onClick={handleUpdateLocation} variant="outline" size="sm">
              Update Location
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto">
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-2" /> Products
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingCart className="w-4 h-4 mr-2" /> Orders
              {pendingOrders.length > 0 && (
                <Badge className="ml-2 bg-yellow-500">{pendingOrders.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">My Products</h2>
              <Button onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-40 bg-gray-200 rounded-t-lg" />
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="overflow-hidden">
                      <div className="h-40 bg-gray-100 flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-gray-300" />
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-blue-600">${product.price.toFixed(2)}</span>
                          <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => { setEditingProduct(product); setShowProductForm(true); }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No products yet</p>
                  <Button onClick={() => setShowProductForm(true)} className="mt-4">
                    Add Your First Product
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <SellerOrderCard key={order.id} order={order} onUpdate={loadData} />
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Product Form Dialog */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSubmit={handleSaveProduct}
            onCancel={() => { setShowProductForm(false); setEditingProduct(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
