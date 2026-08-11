-- ============================================================================
-- Jaxmart B2B Platform - PostgreSQL Database DDL Script for pgAdmin 4
-- Database Engine: PostgreSQL 14 / 15 / 16 / 17
-- Tool: pgAdmin 4 Query Tool
-- ============================================================================

-- 1. DROP EXISTING TABLES IF RE-CREATING (OPTIONAL)
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
CREATE TYPE role_enum AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CAPTAIN', 'SELLER');
CREATE TYPE account_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE action_type_enum AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE', 'STATUS_CHANGE', 'LOGIN', 'LOGOUT');

-- 3. CREATE USERS TABLE
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(32) NOT NULL,
    password_hash VARCHAR(255) DEFAULT '$2a$10$wT0/K83hL36B82i7a40rS.r3PqJmZz0K.x/u0j890gHn6x0W2', -- Default: 123456
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role role_enum NOT NULL DEFAULT 'ADMIN',
    status account_status_enum NOT NULL DEFAULT 'ACTIVE',
    avatar_url TEXT,
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
    assigned_captain_id VARCHAR(64) NOT NULL REFERENCES captain_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CREATE OTPS TABLE (10-MINUTE EXPIRED HASHED OTPS)
CREATE TABLE otps (
    id VARCHAR(64) PRIMARY KEY,
    admin_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. CREATE ACTIVITY & AUDIT LOGS TABLE
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

-- 8. CREATE SECURITY EVENTS TABLE
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

-- 9. CREATE INDEXES FOR FAST QUERY PERFORMANCE
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_otps_admin_expiry ON otps(admin_id, expires_at, used);
CREATE INDEX idx_activity_logs_user_module ON activity_logs(user_id, module, created_at DESC);

-- ============================================================================
-- 10. INITIAL SEED DATA (DEFAULT ADMIN: jaxmart@gmail.com | PASS/OTP: 123456)
-- ============================================================================

-- Insert Default Super Admin & Admin
INSERT INTO users (id, email, mobile, first_name, last_name, role, status, avatar_url) VALUES
('USR-SA-001', 'jaxmart@gmail.com', '+91 98765 43210', 'Jaxmart', 'Super Admin', 'SUPER_ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('USR-ADM-101', 'rahul.admin@jaxmart.com', '+91 98220 11223', 'Rahul', 'Sharma', 'ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('USR-CAP-201', 'amit.captain@jaxmart.com', '+91 97112 33445', 'Amit', 'Verma', 'CAPTAIN', 'ACTIVE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
('USR-CAP-202', 'sneha.captain@jaxmart.com', '+91 97881 66778', 'Sneha', 'Gupta', 'CAPTAIN', 'INACTIVE', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'),
('USR-SEL-301', 'contact@abctraders.in', '+91 91234 56789', 'Rajesh', 'Mehta', 'SELLER', 'ACTIVE', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150');

-- Insert Captain Profile Supervision
INSERT INTO captain_profiles (id, user_id, assigned_admin_id) VALUES
('CAP-PROF-201', 'USR-CAP-201', 'USR-ADM-101'),
('CAP-PROF-202', 'USR-CAP-202', 'USR-ADM-101');

-- Insert Seller Profile Supervision
INSERT INTO seller_profiles (id, user_id, company_name, gstin, assigned_captain_id) VALUES
('SEL-PROF-301', 'USR-SEL-301', 'ABC Traders Pvt Ltd', '24AAAAA0000A1Z5', 'CAP-PROF-201');

-- Insert Initial Seed Audit Log
INSERT INTO activity_logs (id, user_id, user_role, action, module, entity, target_id, description, ip_address, device_info, status, diff_payload) VALUES
('LOG-88901', 'USR-ADM-101', 'ADMIN', 'CREATE', 'Captain Management', 'Captain', 'USR-CAP-201', 'Admin Rahul created Captain Amit Verma', '192.168.1.104', 'Chrome 128 (Windows 11)', 'SUCCESS', '{"Role": "CAPTAIN", "Status": "ACTIVE"}');

-- Confirm Execution
SELECT 'Jaxmart pgAdmin PostgreSQL Database Schema & Seed Data Created Successfully!' AS status;
