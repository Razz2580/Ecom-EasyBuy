import { motion } from 'framer-motion';
import { Bell, Check, X, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Notification } from '@/types';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: number) => void;
  onMarkAllRead?: () => void; // optional new prop
}

export default function NotificationPanel({ notifications, onClose, onMarkRead, onMarkAllRead }: NotificationPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border z-50"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <div className="flex items-center space-x-1">
          {onMarkAllRead && notifications.some(n => !n.isRead) && (
            <Button size="icon" variant="ghost" onClick={onMarkAllRead} title="Mark all as read">
              <CheckCheck className="w-4 h-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-80">
        {notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => onMarkRead(notification.id)}
                    >
                      <Check className="w-4 h-4 text-blue-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bell className="w-12 h-12 mb-2" />
            <p>No notifications</p>
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
}
