
-- EnderHOST Database Setup Script

-- Create database with proper charset if it doesn't exist
CREATE DATABASE IF NOT EXISTS enderdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE enderdb;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS server_configs;
DROP TABLE IF EXISTS order_details;
DROP TABLE IF EXISTS customers;

-- Create customers table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    server_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    order_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create order_details table
CREATE TABLE order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    plan VARCHAR(255) NOT NULL,
    plan_price DECIMAL(10, 2) NOT NULL,
    additional_backups INT DEFAULT 0,
    additional_ports INT DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'UPI/QR',
    payment_id VARCHAR(255),
    payment_date DATETIME,
    discord_username VARCHAR(255),
    billing_cycle INT DEFAULT 3 COMMENT '1 for monthly, 3 for quarterly',
    discount_code VARCHAR(255),
    discount_amount DECIMAL(10, 2),
    discount_type VARCHAR(20),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a table for server configurations
CREATE TABLE server_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    server_type VARCHAR(50) NOT NULL, -- vanilla, modpack, etc.
    ram INT NOT NULL, -- in GB
    cpu INT NOT NULL, -- in percentage
    storage INT NOT NULL, -- in GB
    backups_included INT DEFAULT 0, -- number of backups included
    additional_backups INT DEFAULT 0, -- number of additional backups purchased
    additional_ports INT DEFAULT 0, -- number of additional ports purchased
    status ENUM('provisioning', 'running', 'stopped', 'terminated') DEFAULT 'provisioning',
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create an index on email for faster lookups
CREATE INDEX idx_customer_email ON customers(email);
CREATE INDEX idx_customer_order_id ON customers(order_id);
