# EasyBuy - Location-Based Marketplace

EasyBuy is a full-stack location-based marketplace application where customers can discover and purchase products from nearby sellers. Sellers can manage their inventory and location, while riders handle deliveries when the seller is too far. Payments are processed with an automatic 10% commission for the rider.

## Features

### User Roles
- **Customer**: Browse nearby products, place orders, track deliveries
- **Seller**: Manage products, accept/decline orders, update location
- **Rider**: Accept delivery requests, track deliveries, earn commissions

### Core Features
- JWT-based authentication with role-based access control
- Real-time notifications via WebSocket (STOMP)
- Geolocation-based product search using Haversine formula
- Order management with multiple status workflows
- Payment integration with Stripe
- Automatic payment split (90% to seller, 10% to rider)

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security (JWT)
- Spring Data JPA
- Spring WebSocket (STOMP)
- MySQL 8
- Stripe Java SDK

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Framer Motion (animations)
- Formik & Yup (forms & validation)
- Axios (HTTP client)
- SockJS & STOMP (WebSocket)
- Stripe React SDK

## Project Structure

```
easybuy/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/easybuy/
│   │   ├── config/         # Configuration classes
│   │   ├── controller/     # REST controllers
│   │   ├── service/        # Business logic
│   │   ├── repository/     # JPA repositories
│   │   ├── entity/         # JPA entities
│   │   ├── dto/            # Data transfer objects
│   │   ├── security/       # JWT & security
│   │   ├── websocket/      # WebSocket handlers
│   │   └── util/           # Utility classes
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── schema.sql          # Database schema
│
└── frontend/               # React frontend
    ├── src/
    │   ├── components/     # React components
    │   ├── pages/          # Page components
    │   ├── context/        # React context
    │   ├── services/       # API services
    │   ├── types/          # TypeScript types
    │   └── hooks/          # Custom hooks
    ├── package.json
    └── vite.config.ts
```

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Maven 3.8+
- Stripe account (for payments)

### Backend Setup

1. **Create the database:**
```bash
mysql -u root -p < backend/schema.sql
```

2. **Configure environment variables:**
Create a `.env` file in the backend directory:
```properties
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

3. **Run the backend:**
```bash
cd backend
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment variables:**
Create a `.env` file in the frontend directory:
```properties
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

3. **Run the frontend:**
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/nearby?lat={lat}&lng={lng}&radius={radius}` - Get nearby products
- `GET /api/products/search?keyword={keyword}` - Search products
- `POST /api/products` - Create product (Seller only)
- `PUT /api/products/{id}` - Update product (Seller only)
- `DELETE /api/products/{id}` - Delete product (Seller only)

### Orders
- `GET /api/orders/my-orders` - Get customer orders
- `GET /api/orders/seller-orders` - Get seller orders
- `POST /api/orders` - Create order (Customer only)
- `PUT /api/orders/{id}/accept` - Accept order (Seller only)
- `PUT /api/orders/{id}/decline` - Decline order (Seller only)
- `POST /api/orders/{id}/request-rider` - Request rider delivery (Customer only)

### Seller
- `GET /api/seller/profile` - Get seller profile
- `PUT /api/seller/profile` - Update seller profile
- `PUT /api/seller/location` - Update seller location

### Rider
- `GET /api/rider/profile` - Get rider profile
- `PUT /api/rider/online-status` - Toggle online status
- `PUT /api/rider/location` - Update rider location
- `GET /api/rider/available-deliveries` - Get available deliveries
- `POST /api/rider/deliveries/{id}/accept` - Accept delivery
- `PUT /api/rider/deliveries/{id}/status` - Update delivery status

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read

## WebSocket Channels

- `/ws` - WebSocket endpoint
- `/topic/delivery-requests` - Broadcast delivery requests to riders
- `/user/{userId}/queue/notifications` - User-specific notifications
- `/user/{userId}/queue/orders` - Order updates
- `/user/{userId}/queue/rider-location` - Rider location updates

## Order Workflow

1. **Customer** places an order
2. **Seller** receives notification and can accept/decline
3. If accepted and seller is within 2km, seller delivers directly
4. If seller is far, customer can request a rider
5. **Rider** receives delivery request and can accept
6. Rider picks up from seller and delivers to customer
7. Upon delivery, payment is split (90% seller, 10% rider)

## Payment Flow

1. Customer clicks "Pay" for an order
2. Backend creates Stripe PaymentIntent
3. Customer enters card details (Stripe Elements)
4. Payment is confirmed
5. Upon delivery, funds are transferred to seller and rider

## Security

- JWT-based authentication
- Role-based access control
- Password hashing with BCrypt
- CORS configuration
- Input validation

## Testing

### Test Card (Stripe)
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

### Sample Users
You can register users with different roles:
- Customer: Browse and order products
- Seller: Create products and manage orders
- Rider: Accept and complete deliveries

## License

MIT License
