-- EasyBuy Database Schema
-- Run this script to create the database and tables

CREATE DATABASE IF NOT EXISTS easybuy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE easybuy;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role ENUM('CUSTOMER','SELLER','RIDER') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Sellers table
CREATE TABLE IF NOT EXISTS sellers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    store_name VARCHAR(255),
    store_description TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Riders table
CREATE TABLE IF NOT EXISTS riders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    vehicle_type VARCHAR(50),
    vehicle_number VARCHAR(50),
    is_online BOOLEAN DEFAULT FALSE,
    current_latitude DECIMAL(10,8),
    current_longitude DECIMAL(11,8),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    seller_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(500),
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING','ACCEPTED','SELLER_DELIVERING','RIDER_ASSIGNED','PICKED_UP','DELIVERED','CANCELLED') DEFAULT 'PENDING',
    delivery_method ENUM('SELLER','RIDER') NULL,
    customer_latitude DECIMAL(10,8),
    customer_longitude DECIMAL(11,8),
    delivery_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT UNIQUE NOT NULL,
    rider_id BIGINT,
    pickup_latitude DECIMAL(10,8),
    pickup_longitude DECIMAL(11,8),
    drop_latitude DECIMAL(10,8),
    drop_longitude DECIMAL(11,8),
    status ENUM('REQUESTED','ACCEPTED','AT_SELLER','PICKED_UP','DELIVERED') DEFAULT 'REQUESTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (rider_id) REFERENCES riders(id)
) ENGINE=InnoDB;

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    seller_amount DECIMAL(10,2) NOT NULL,
    rider_amount DECIMAL(10,2),
    status ENUM('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING',
    payment_intent_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    related_order_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Create indexes for better performance
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_deliveries_rider ON deliveries(rider_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_sellers_location ON sellers(latitude, longitude);
CREATE INDEX idx_riders_location ON riders(current_latitude, current_longitude);
CREATE INDEX idx_riders_online ON riders(is_online);

-- Sample data (optional)
-- Uncomment to insert sample data

-- INSERT INTO users (email, password_hash, full_name, phone, role) VALUES
-- ('customer@example.com', '$2a$10$...', 'John Customer', '1234567890', 'CUSTOMER'),
-- ('seller@example.com', '$2a$10$...', 'Jane Seller', '0987654321', 'SELLER'),
-- ('rider@example.com', '$2a$10$...', 'Bob Rider', '5555555555', 'RIDER');

-- INSERT INTO sellers (user_id, store_name, store_description, address) VALUES
-- (2, 'Jane\'s Store', 'Best products in town', '123 Main St');

-- INSERT INTO riders (user_id, vehicle_type, vehicle_number) VALUES
-- (3, 'Motorcycle', 'ABC123');

-- INSERT INTO products (seller_id, name, description, price, category, stock) VALUES
-- (1, 'Sample Product', 'A great product', 29.99, 'General', 100);
