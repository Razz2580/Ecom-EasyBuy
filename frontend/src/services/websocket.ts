import SockJS from 'sockjs-client';
import { Client, type IMessage } from '@stomp/stompjs';
import { apiService } from './api';

// Compute WebSocket URL from the same API base used by axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const WS_URL = API_BASE_URL.replace(/^http/, 'ws').replace(/\/api$/, '') + '/ws';

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, (message: any) => void> = new Map();

  connect(onConnect?: () => void, onError?: (error: any) => void) {
    const token = apiService.getToken();
    if (!token) {
      console.error('No token available for WebSocket connection');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('WebSocket connected:', frame);
      this.subscribeToUserQueues();
      onConnect?.();
    };

    this.client.onDisconnect = () => {
      console.log('WebSocket disconnected');
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message']);
      onError?.(frame);
    };

    this.client.onWebSocketError = (event) => {
      console.error('WebSocket error:', event);
      onError?.(event);
    };

    this.client.activate();
  }

  private subscribeToUserQueues() {
    if (!this.client?.connected) return;

    const user = apiService.getCurrentUser();
    if (!user) return;

    this.client.subscribe(`/user/${user.userId}/queue/notifications`, (message: IMessage) => {
      const notification = JSON.parse(message.body);
      this.subscriptions.get('notifications')?.(notification);
    });

    this.client.subscribe(`/user/${user.userId}/queue/orders`, (message: IMessage) => {
      const orderUpdate = JSON.parse(message.body);
      this.subscriptions.get('orders')?.(orderUpdate);
    });

    this.client.subscribe(`/user/${user.userId}/queue/delivery-requests`, (message: IMessage) => {
      const deliveryRequest = JSON.parse(message.body);
      this.subscriptions.get('delivery-requests')?.(deliveryRequest);
    });

    this.client.subscribe(`/user/${user.userId}/queue/rider-location`, (message: IMessage) => {
      const location = JSON.parse(message.body);
      this.subscriptions.get('rider-location')?.(location);
    });

    if (user.role === 'RIDER') {
      this.client.subscribe('/topic/delivery-requests', (message: IMessage) => {
        const deliveryRequest = JSON.parse(message.body);
        this.subscriptions.get('broadcast-delivery-requests')?.(deliveryRequest);
      });
    }
  }

  subscribe(channel: string, callback: (message: any) => void) {
    this.subscriptions.set(channel, callback);
  }

  unsubscribe(channel: string) {
    this.subscriptions.delete(channel);
  }

  send(destination: string, body: any) {
    if (!this.client?.connected) {
      console.error('WebSocket not connected');
      return;
    }
    this.client.publish({
      destination: `/app${destination}`,
      body: JSON.stringify(body),
    });
  }

  updateLocation(latitude: number, longitude: number) {
    this.send('/location/update', { latitude, longitude });
  }

  sendRiderLocation(latitude: number, longitude: number) {
    this.send('/rider/location', { latitude, longitude, timestamp: Date.now() });
  }

  disconnect() {
    this.client?.deactivate();
    this.client = null;
    this.subscriptions.clear();
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export const webSocketService = new WebSocketService();
