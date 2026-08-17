-- ============================================================================
-- Jaxmart B2B Platform - PostgreSQL Database DDL Script for pgAdmin 4
-- Database Engine: PostgreSQL 14 / 15 / 16 / 17
-- Tool: pgAdmin 4 Query Tool
-- ============================================================================

-- 1. DROP EXISTING TABLES IF RE-CREATING (OPTIONAL)
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;
DROP TABLE IF EXISTS rfqs CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS security_events CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS otps CASCADE;
DROP TABLE IF EXISTS seller_profiles CASCADE;
DROP TABLE IF EXISTS captain_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS role_enum CASCADE;
DROP TYPE IF EXISTS account_status_enum CASCADE;
DROP TYPE IF EXISTS action_type_enum CASCADE;

-- 2. CREATE ENUM TYPES
CREATE TYPE role_enum AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CAPTAIN', 'SELLER', 'CUSTOMER');
CREATE TYPE account_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE action_type_enum AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE', 'STATUS_CHANGE', 'LOGIN', 'LOGOUT', 'RESTORE');

-- 3. CREATE USERS TABLE
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(32) NOT NULL,
    password_hash VARCHAR(255) DEFAULT '123456',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role role_enum NOT NULL DEFAULT 'ADMIN',
    status account_status_enum NOT NULL DEFAULT 'ACTIVE',
    avatar_url TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CREATE CAPTAIN PROFILES TABLE (SUPERVISED BY ADMIN)
CREATE TABLE captain_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_admin_id VARCHAR(64) NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CREATE SELLER PROFILES TABLE (SUPERVISED BY CAPTAIN)
CREATE TABLE seller_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    gstin VARCHAR(32),
    assigned_captain_id VARCHAR(64) NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CREATE CATEGORIES TABLE
CREATE TABLE categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. CREATE PRODUCTS TABLE
CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(64) UNIQUE NOT NULL,
    category_id VARCHAR(64) REFERENCES categories(id),
    seller_id VARCHAR(64) REFERENCES users(id),
    price DECIMAL(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'APPROVED',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. CREATE RFQS TABLE (REQUEST FOR QUOTATIONS)
CREATE TABLE rfqs (
    id VARCHAR(64) PRIMARY KEY,
    rfq_number VARCHAR(64) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    seller_id VARCHAR(64) REFERENCES users(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. CREATE QUOTATIONS TABLE
CREATE TABLE quotations (
    id VARCHAR(64) PRIMARY KEY,
    rfq_id VARCHAR(64) REFERENCES rfqs(id) ON DELETE CASCADE,
    seller_id VARCHAR(64) REFERENCES users(id),
    total_amount DECIMAL(12,2) NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'SENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. CREATE ORDERS TABLE
CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(64) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    seller_id VARCHAR(64) REFERENCES users(id),
    total_amount DECIMAL(12,2) NOT NULL,
    payment_status VARCHAR(32) NOT NULL DEFAULT 'PAID',
    order_status VARCHAR(32) NOT NULL DEFAULT 'DELIVERED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. CREATE PAYMENTS TABLE
CREATE TABLE payments (
    id VARCHAR(64) PRIMARY KEY,
    payment_number VARCHAR(64) UNIQUE NOT NULL,
    order_id VARCHAR(64) REFERENCES orders(id),
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED',
    transaction_ref VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. CREATE NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_role VARCHAR(32) NOT NULL DEFAULT 'ALL',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. CREATE SYSTEM SETTINGS TABLE
CREATE TABLE system_settings (
    key_name VARCHAR(100) PRIMARY KEY,
    value_json JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. CREATE ACTIVITY & AUDIT LOGS TABLE
CREATE TABLE activity_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    user_role role_enum NOT NULL,
    action action_type_enum NOT NULL,
    module VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    device_info TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'SUCCESS',
    diff_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
           
-- 15. CREATE SECURITY EVENTS TABLE
CREATE TABLE security_events (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    event_type VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    device TEXT NOT NULL,
    location VARCHAR(100),
    status VARCHAR(32) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. INDEXES
CREATE INDEX idx_users_role_status ON users(role, status, is_deleted);
CREATE INDEX idx_products_seller ON products(seller_id, is_deleted);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at DESC);

-- ============================================================================
-- 17. INITIAL SEED DATA FOR SUPER ADMIN & PLATFORM CORE
-- ============================================================================

INSERT INTO users (id, email, mobile, password_hash, first_name, last_name, role, status, avatar_url, is_deleted) VALUES
('USR-SA-001', 'Jax@gmail.com', '+91 98765 43210', '123456', 'Super', 'Admin', 'SUPER_ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', FALSE),
('USR-SA-002', 'superadmin@jaxmart.com', '+91 99999 88888', '123456', 'Main', 'SuperAdmin', 'SUPER_ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', FALSE),
('USR-ADM-101', 'jaxmart@gmail.com', '+91 98220 11223', '123456', 'Jaxmart', 'Admin', 'ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', FALSE),
('USR-CAP-201', 'amit.captain@jaxmart.com', '+91 97112 33445', '123456', 'Amit', 'Verma', 'CAPTAIN', 'ACTIVE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', FALSE),
('USR-SEL-301', 'contact@abctraders.in', '+91 91234 56789', '123456', 'Rajesh', 'Mehta', 'SELLER', 'ACTIVE', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', FALSE),
('USR-CUST-401', 'customer@reliancestores.com', '+91 98111 22334', '123456', 'Sanjay', 'Patel', 'CUSTOMER', 'ACTIVE', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', FALSE);

INSERT INTO categories (id, name, slug, description) VALUES
('CAT-001', 'Industrial Hardware', 'industrial-hardware', 'Heavy duty industrial tools and machinery'),
('CAT-002', 'Electrical & Electronics', 'electrical-electronics', 'Circuit breakers, cables, switches & industrial electronics'),
('CAT-003', 'Safety Gear & PPE', 'safety-ppe', 'Helmets, safety goggles, gloves and boots');

INSERT INTO products (id, name, sku, category_id, seller_id, price, stock, status, is_deleted) VALUES
('PRD-101', 'Heavy Duty Angle Grinder 850W', 'SKU-TOOL-001', 'CAT-001', 'USR-SEL-301', 3499.00, 120, 'APPROVED', FALSE),
('PRD-102', 'Industrial Circuit Breaker 63A 4P', 'SKU-ELEC-002', 'CAT-002', 'USR-SEL-301', 1250.00, 450, 'APPROVED', FALSE),
('PRD-103', 'Steel Toe Executive Safety Boots', 'SKU-SAFE-003', 'CAT-003', 'USR-SEL-301', 1899.00, 200, 'APPROVED', FALSE);

INSERT INTO rfqs (id, rfq_number, customer_name, seller_id, product_name, quantity, status, notes) VALUES
('RFQ-501', 'RFQ-2026-001', 'Reliance Industrial Infra', 'USR-SEL-301', 'Heavy Duty Angle Grinder 850W', 50, 'QUOTED', 'Urgent bulk requirement for plant expansion');

INSERT INTO quotations (id, rfq_id, seller_id, total_amount, valid_until, status) VALUES
('QTE-601', 'RFQ-501', 'USR-SEL-301', 165000.00, CURRENT_TIMESTAMP + INTERVAL '15 days', 'ACCEPTED');

INSERT INTO orders (id, order_number, customer_name, seller_id, total_amount, payment_status, order_status) VALUES
('ORD-701', 'ORD-2026-8801', 'Reliance Industrial Infra', 'USR-SEL-301', 165000.00, 'PAID', 'DELIVERED');

INSERT INTO payments (id, payment_number, order_id, amount, payment_method, status, transaction_ref) VALUES
('PAY-801', 'PAY-2026-9901', 'ORD-701', 165000.00, 'BANK_TRANSFER', 'COMPLETED', 'TXN-HDFC-998811');

INSERT INTO notifications (id, title, message, target_role) VALUES
('NTF-901', 'Super Admin System Announcement', 'Welcome to the unified Jaxmart B2B Captain Platform!', 'ALL');

-- 14. CREATE CAPTAIN TASKS TABLE
CREATE TABLE captain_tasks (
    id VARCHAR(64) PRIMARY KEY,
    captain_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    seller_id VARCHAR(64) REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
    
-- 15. CREATE SELLER FOLLOWUPS TABLE
CREATE TABLE seller_followups (
    id VARCHAR(64) PRIMARY KEY,
    captain_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    seller_id VARCHAR(64) REFERENCES users(id),
    notes TEXT NOT NULL,
    next_followup_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. CREATE CAPTAIN ATTENDANCE TABLE (GPS PUNCH IN / PUNCH OUT)
CREATE TABLE captain_attendance (
    id VARCHAR(64) PRIMARY KEY,
    captain_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    punch_in_time TIMESTAMP WITH TIME ZONE,
    punch_in_location TEXT,
    punch_out_time TIMESTAMP WITH TIME ZONE,
    punch_out_location TEXT,
    total_hours VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'PUNCHED_IN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. CREATE CAPTAIN FIELD PRODUCTS TABLE (SELLING PRODUCTS COLLECTION & ADMIN APPROVAL)
CREATE TABLE captain_field_products (
    id VARCHAR(64) PRIMARY KEY,
    captain_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    color VARCHAR(50),
    image_url TEXT,
    color_image_url TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO captain_field_products (id, captain_id, name, category, sub_category, price, color, image_url, color_image_url, status) VALUES
('FPRD-101', 'USR-CAP-201', 'Industrial Power Angle Grinder 850W', 'Industrial Hardware', 'Power Tools', 3499.00, 'Red', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300', 'PENDING');

SELECT 'Jaxmart PostgreSQL Database Schema & Captain Field Products Approval Extensions Ready!' AS status;





