export const UserRole = {
  CUSTOMER: 'CUSTOMER',
  SELLER: 'SELLER',
  RIDER: 'RIDER'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export const OrderStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  SELLER_DELIVERING: 'SELLER_DELIVERING',
  RIDER_ASSIGNED: 'RIDER_ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

export const DeliveryMethod = {
  SELLER: 'SELLER',
  RIDER: 'RIDER'
} as const;

export type DeliveryMethodType = typeof DeliveryMethod[keyof typeof DeliveryMethod];

export const DeliveryStatus = {
  REQUESTED: 'REQUESTED',
  ACCEPTED: 'ACCEPTED',
  AT_SELLER: 'AT_SELLER',
  PICKED_UP: 'PICKED_UP',
  DELIVERED: 'DELIVERED'
} as const;

export type DeliveryStatusType = typeof DeliveryStatus[keyof typeof DeliveryStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
} as const;

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRoleType;
  sellerId?: number;
  riderId?: number;
}

export interface Seller {
  id: number;
  storeName: string;
  storeDescription?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  sellerName?: string;
  sellerPhone?: string;
}

export interface Rider {
  id: number;
  vehicleType?: string;
  vehicleNumber?: string;
  isOnline?: boolean;
  currentLatitude?: number;
  currentLongitude?: number;
  riderName?: string;
  riderPhone?: string;
  distance?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  stock: number;
  sellerId: number;
  sellerName?: string;
  storeName?: string;
  sellerLatitude?: number;
  sellerLongitude?: number;
  distance?: number;
  createdAt?: string;
}

export interface Order {
  id: number;
  customerId: number;
  customerName?: string;
  productId: number;
  productName: string;
  productImage?: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatusType;
  deliveryMethod?: DeliveryMethodType;
  customerLatitude?: number;
  customerLongitude?: number;
  deliveryAddress?: string;
  seller?: Seller;
  rider?: Rider;
  createdAt?: string;
  updatedAt?: string;
}

export interface Delivery {
  id: number;
  orderId: number;
  rider?: Rider;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropLatitude?: number;
  dropLongitude?: number;
  status: DeliveryStatusType;
  distance?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  sellerAmount: number;
  riderAmount?: number;
  status: PaymentStatusType;
  paymentIntentId?: string;
  createdAt?: string;
}

export interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  relatedOrderId?: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  email: string;
  fullName: string;
  role: UserRoleType;
  sellerId?: number;
  riderId?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRoleType;
  storeName?: string;
  storeDescription?: string;
  address?: string;
  vehicleType?: string;
  vehicleNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
}

export interface NearbySearchParams {
  lat: number;
  lng: number;
  radius?: number;
  category?: string;
  keyword?: string;
}
