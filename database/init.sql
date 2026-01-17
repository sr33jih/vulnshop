-- VulnShop Database Initialization
-- WARNING: This database contains intentional vulnerabilities for educational purposes

-- Drop existing tables
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(20) DEFAULT 'user',
    credit_card VARCHAR(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(255),
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items table
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users
-- Password for all users: password123
-- Hash verified from actual registration with password123
INSERT INTO users (username, email, password, first_name, last_name, phone, address, role, credit_card) VALUES
('admin', 'admin@vulnshop.com', '$2b$10$wITlKdk/t0VtUvTVuunccOZFL9zB4w/K0n1NWoVZKaBJMqsNhRn4.', 'Admin', 'User', '1234567890', '123 Admin St', 'admin', '4532123456789012'),
('john_doe', 'john@example.com', '$2b$10$wITlKdk/t0VtUvTVuunccOZFL9zB4w/K0n1NWoVZKaBJMqsNhRn4.', 'John', 'Doe', '5551234567', '456 Main St', 'user', '4532987654321098'),
('jane_smith', 'jane@example.com', '$2b$10$wITlKdk/t0VtUvTVuunccOZFL9zB4w/K0n1NWoVZKaBJMqsNhRn4.', 'Jane', 'Smith', '5559876543', '789 Oak Ave', 'user', '4532111122223333'),
('bob_wilson', 'bob@example.com', '$2b$10$wITlKdk/t0VtUvTVuunccOZFL9zB4w/K0n1NWoVZKaBJMqsNhRn4.', 'Bob', 'Wilson', '5555555555', '321 Pine Rd', 'user', '4532444455556666');

-- Insert sample products
INSERT INTO products (name, description, price, category, image_url, stock) VALUES
('Classic White T-Shirt', 'Premium cotton t-shirt in classic white', 24.99, 'Tops', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 100),
('Blue Denim Jeans', 'Comfortable slim-fit denim jeans', 59.99, 'Bottoms', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 75),
('Black Leather Jacket', 'Genuine leather jacket with zipper', 149.99, 'Outerwear', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', 30),
('Red Hoodie', 'Cozy fleece hoodie with front pocket', 44.99, 'Tops', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 60),
('Gray Sneakers', 'Comfortable athletic sneakers', 79.99, 'Footwear', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400', 50),
('Summer Dress', 'Light floral summer dress', 54.99, 'Dresses', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400', 40),
('Wool Beanie', 'Warm winter beanie', 19.99, 'Accessories', 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400', 120),
('Leather Belt', 'Classic brown leather belt', 29.99, 'Accessories', 'https://images.unsplash.com/photo-1624222247344-550fb60583c8?w=400', 80),
('Sports Shorts', 'Breathable athletic shorts', 34.99, 'Bottoms', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400', 90),
('Winter Coat', 'Warm insulated winter coat', 189.99, 'Outerwear', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400', 25);

-- Insert sample cart items
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(2, 1, 2),
(2, 5, 1),
(3, 3, 1),
(3, 6, 2);

-- Insert sample orders
INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES
(2, 129.97, 'completed', '456 Main St'),
(3, 204.98, 'pending', '789 Oak Ave'),
(4, 59.99, 'shipped', '321 Pine Rd');

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 2, 24.99),
(1, 5, 1, 79.99),
(2, 3, 1, 149.99),
(2, 6, 1, 54.99),
(3, 2, 1, 59.99);

-- Insert sample reviews
INSERT INTO reviews (product_id, user_id, rating, comment) VALUES
(1, 2, 5, 'Great quality t-shirt! Very comfortable.'),
(1, 3, 4, 'Nice fit, but slightly thin material.'),
(3, 2, 5, 'Excellent leather jacket. Worth the price!'),
(5, 4, 4, 'Comfortable sneakers for daily wear.'),
(6, 3, 5, 'Beautiful dress for summer!');
