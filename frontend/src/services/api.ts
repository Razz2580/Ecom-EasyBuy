import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Auth APIs
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.api.post('/auth/register', data);
    this.setToken(response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post('/auth/login', data);
    this.setToken(response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  }

  logout() {
    this.clearToken();
  }

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // User APIs
  async getUserProfile() {
    const response = await this.api.get('/user/profile');
    return response.data;
  }

  async updateUserProfile(data: { fullName?: string; phone?: string; address?: string }) {
    const response = await this.api.put('/user/profile', data);
    return response.data;
  }

  // Product APIs
  async getAllProducts() {
    const response = await this.api.get('/products');
    return response.data;
  }

  async getProductById(id: number) {
    const response = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async getNearbyProducts(lat: number, lng: number, radius: number = 5, category?: string) {
    const params = new URLSearchParams({ lat: lat.toString(), lng: lng.toString(), radius: radius.toString() });
    if (category) params.append('category', category);
    const response = await this.api.get(`/products/nearby?${params}`);
    return response.data;
  }

  async searchProducts(keyword: string) {
    const response = await this.api.get(`/products/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  }

  async getProductsByCategory(category: string) {
    const response = await this.api.get(`/products/category/${category}`);
    return response.data;
  }

  async getProductsBySeller(sellerId: number) {
    const response = await this.api.get(`/products/seller/${sellerId}`);
    return response.data;
  }

  async createProduct(data: { name: string; description?: string; price: number; category?: string; imageUrl?: string; stock: number }) {
   const response = await this.api.post('/products/addProduct', data);
    return response.data;
  }

  async updateProduct(id: number, data: { name: string; description?: string; price: number; category?: string; imageUrl?: string; stock: number }) {
    const response = await this.api.put(`/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: number) {
    const response = await this.api.delete(`/products/${id}`);
    return response.data;
  }

  // Order APIs
  async createOrder(data: { productId: number; quantity: number; customerLatitude?: number; customerLongitude?: number; deliveryAddress?: string }) {
    const response = await this.api.post('/orders', data);
    return response.data;
  }

  async getOrderById(id: number) {
    const response = await this.api.get(`/orders/${id}`);
    return response.data;
  }

  async getCustomerOrders() {
    const response = await this.api.get('/orders/my-orders');
    return response.data;
  }

  async getSellerOrders() {
    const response = await this.api.get('/orders/seller-orders');
    return response.data;
  }

  async acceptOrder(orderId: number) {
    const response = await this.api.put(`/orders/${orderId}/accept`);
    return response.data;
  }

  async declineOrder(orderId: number) {
    const response = await this.api.put(`/orders/${orderId}/decline`);
    return response.data;
  }

  async requestRiderDelivery(orderId: number) {
    const response = await this.api.post(`/orders/${orderId}/request-rider`);
    return response.data;
  }

  // Seller APIs
  async getSellerProfile() {
    const response = await this.api.get('/seller/profile');
    return response.data;
  }

  async updateSellerProfile(data: { storeName?: string; storeDescription?: string; address?: string; latitude?: number; longitude?: number }) {
    const response = await this.api.put('/seller/profile', data);
    return response.data;
  }

  async updateSellerLocation(latitude: number, longitude: number) {
    const response = await this.api.put('/seller/location', { latitude, longitude });
    return response.data;
  }

  // Rider APIs
  async getRiderProfile() {
    const response = await this.api.get('/rider/profile');
    return response.data;
  }

  async updateRiderProfile(data: { vehicleType?: string; vehicleNumber?: string }) {
    const response = await this.api.put('/rider/profile', data);
    return response.data;
  }

  async toggleOnlineStatus(isOnline: boolean) {
    const response = await this.api.put(`/rider/online-status?isOnline=${isOnline}`);
    return response.data;
  }

  async updateRiderLocation(latitude: number, longitude: number) {
    const response = await this.api.put('/rider/location', { latitude, longitude });
    return response.data;
  }

  async getAvailableDeliveries(lat: number, lng: number, radius: number = 10) {
    const response = await this.api.get(`/rider/available-deliveries?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.data;
  }

  async getRiderDeliveries() {
    const response = await this.api.get('/rider/my-deliveries');
    return response.data;
  }

  async acceptDelivery(deliveryId: number) {
    const response = await this.api.post(`/rider/deliveries/${deliveryId}/accept`);
    return response.data;
  }

  async updateDeliveryStatus(deliveryId: number, status: string) {
    const response = await this.api.put(`/rider/deliveries/${deliveryId}/status?status=${status}`);
    return response.data;
  }

  // Delivery APIs
  async getNearbyDeliveries(lat: number, lng: number, radius: number = 10) {
    const response = await this.api.get(`/deliveries/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.data;
  }

  // Payment APIs
  async createPaymentIntent(orderId: number) {
    const response = await this.api.post('/payments/create-intent', { orderId });
    return response.data;
  }

  async confirmPayment(paymentIntentId: string) {
    const response = await this.api.post('/payments/confirm', { paymentIntentId });
    return response.data;
  }

  async getPaymentStatus(orderId: number) {
    const response = await this.api.get(`/payments/order/${orderId}`);
    return response.data;
  }

  // Notification APIs
  async getNotifications() {
    const response = await this.api.get('/notifications');
    return response.data;
  }

  async getUnreadNotifications() {
    const response = await this.api.get('/notifications/unread');
    return response.data;
  }

  async getUnreadCount() {
    const response = await this.api.get('/notifications/unread-count');
    return response.data;
  }

  async markNotificationAsRead(id: number) {
    const response = await this.api.put(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await this.api.put('/notifications/read-all');
    return response.data;
  }
}

export const apiService = new ApiService();
