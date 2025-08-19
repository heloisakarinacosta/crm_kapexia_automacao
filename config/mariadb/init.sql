CREATE TABLE IF NOT EXISTS administrators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin)
-- The password should be hashed by the application before storing, or use a secure hash directly if possible.
-- For now, we will insert a placeholder that the backend will need to handle or be updated.
-- Placeholder for admin user, actual hashing will be done by the backend service upon first setup or via a seed script.
-- INSERT IGNORE INTO administrators (username, password_hash, email) VALUES ('admin', 'NEEDS_HASHING_bcrypt_hash_of_admin', 'admin@kapexia.com');

CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    features TEXT, -- JSON or comma-separated list of features
    ai_package_details TEXT, -- JSON describing AI usage limits/package
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_global_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_name VARCHAR(255) NOT NULL UNIQUE,
    config_value TEXT, -- Could be JSON for complex configurations
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL UNIQUE, -- e.g., 'welcome_email', 'password_reset'
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL, -- HTML or plain text content
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_integrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    integration_name VARCHAR(255) NOT NULL UNIQUE, -- e.g., 'stripe_payment_gateway'
    config_details TEXT, -- JSON containing API keys, webhook URLs, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

