import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bike, MapPin, Package, Bell, LogOut, Power, DollarSign, CheckCircle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { apiService, webSocketService } from '@/services';
import { DeliveryStatus } from '@/types';
import type { Delivery, Notification, Rider } from '@/types';
import DeliveryCard from '@/components/rider/DeliveryCard';
import NotificationPanel from '@/components/common/NotificationPanel';

export default function RiderDashboard() {
  const { logout } = useAuth();
  const [rider, setRider] = useState<Rider | null>(null);
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<Delivery[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    loadData();
    setupWebSocket();

    // Start location tracking
    const locationInterval = setInterval(updateLocation, 30000); // Every 30 seconds

    return () => {
      clearInterval(locationInterval);
      webSocketService.unsubscribe('delivery-requests');
      webSocketService.unsubscribe('notifications');
    };
  }, []);

  useEffect(() => {
    if (location && rider?.isOnline) {
      loadAvailableDeliveries();
    }
  }, [location, rider?.isOnline]);

  const setupWebSocket = () => {
    webSocketService.subscribe('broadcast-delivery-requests', (deliveryRequest) => {
      if (rider?.isOnline) {
        setAvailableDeliveries((prev) => [deliveryRequest, ...prev]);
      }
    });

    webSocketService.subscribe('notifications', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [riderData, myDeliveriesData, notificationsData, unreadData] = await Promise.all([
        apiService.getRiderProfile(),
        apiService.getRiderDeliveries(),
        apiService.getNotifications(),
        apiService.getUnreadCount(),
      ]);
      setRider(riderData);
      setMyDeliveries(myDeliveriesData);
      setNotifications(notificationsData);
      setUnreadCount(unreadData.count);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableDeliveries = async () => {
    if (!location) return;
    try {
      const data = await apiService.getAvailableDeliveries(location.lat, location.lng, 10);
      setAvailableDeliveries(data);
    } catch (error) {
      console.error('Error loading available deliveries:', error);
    }
  };

  const updateLocation = () => {
    if (!navigator.geolocation || !rider?.isOnline) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await apiService.updateRiderLocation(
            position.coords.latitude,
            position.coords.longitude
          );
          // Also send via WebSocket for real-time updates
          webSocketService.sendRiderLocation(
            position.coords.latitude,
            position.coords.longitude
          );
        } catch (error) {
          console.error('Error updating location:', error);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  };

  const handleToggleOnline = async () => {
    try {
      const newStatus = !rider?.isOnline;
      await apiService.toggleOnlineStatus(newStatus);
      setRider((prev) => prev ? { ...prev, isOnline: newStatus } : null);
      
      if (newStatus && location) {
        loadAvailableDeliveries();
      }
    } catch (error) {
      console.error('Error toggling online status:', error);
    }
  };

  const handleAcceptDelivery = async (deliveryId: number) => {
    try {
      await apiService.acceptDelivery(deliveryId);
      loadData();
      loadAvailableDeliveries();
    } catch (error) {
      console.error('Error accepting delivery:', error);
    }
  };

  const handleUpdateStatus = async (deliveryId: number, status: string) => {
    try {
      await apiService.updateDeliveryStatus(deliveryId, status);
      loadData();
    } catch (error) {
      console.error('Error updating delivery status:', error);
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

  const activeDeliveries = myDeliveries.filter(
    (d) => d.status !== DeliveryStatus.DELIVERED
  );
  const completedDeliveries = myDeliveries.filter(
    (d) => d.status === DeliveryStatus.DELIVERED
  );

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
                className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center mr-3"
              >
                <Bike className="w-5 h-5 text-white" />
              </motion.div>
             <div>
               <h1 className="text-xl font-bold text-gray-900">Rider Dashboard</h1>
               <Link to="/profile">
               <p className="text-xs text-gray-500 cursor-pointer hover:text-blue-600">
                  {user?.fullName}
               </p>
               </Link>
                </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Online Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="online-mode"
                  checked={rider?.isOnline || false}
                  onCheckedChange={handleToggleOnline}
                />
                <Label htmlFor="online-mode" className={rider?.isOnline ? 'text-green-600' : 'text-gray-500'}>
                  {rider?.isOnline ? 'Online' : 'Offline'}
                </Label>
              </div>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Deliveries</p>
                <p className="text-2xl font-bold">{activeDeliveries.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{completedDeliveries.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Earnings</p>
                <p className="text-2xl font-bold">$0.00</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Info */}
        {location && (
          <Card className="mb-6">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Current: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-green-500 animate-pulse" />
                <span className="text-xs text-green-600">Tracking Active</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="available">
              <Package className="w-4 h-4 mr-2" /> Available
              {availableDeliveries.length > 0 && (
                <Badge className="ml-2 bg-blue-500">{availableDeliveries.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">
              <Navigation className="w-4 h-4 mr-2" /> My Deliveries
              {activeDeliveries.length > 0 && (
                <Badge className="ml-2 bg-orange-500">{activeDeliveries.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle className="w-4 h-4 mr-2" /> Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {!rider?.isOnline ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Power className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Go online to see available deliveries</p>
                  <Button onClick={handleToggleOnline} className="mt-4">
                    Go Online
                  </Button>
                </CardContent>
              </Card>
            ) : isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : availableDeliveries.length > 0 ? (
              availableDeliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  type="available"
                  onAccept={() => handleAcceptDelivery(delivery.id)}
                />
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No available deliveries nearby</p>
                  <Button onClick={loadAvailableDeliveries} className="mt-4">
                    Refresh
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeDeliveries.length > 0 ? (
              activeDeliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  type="active"
                  onUpdateStatus={handleUpdateStatus}
                />
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Navigation className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No active deliveries</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedDeliveries.length > 0 ? (
              completedDeliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  type="completed"
                />
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No completed deliveries yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
