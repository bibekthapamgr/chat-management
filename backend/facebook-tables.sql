-- Create facebook_pages table
CREATE TABLE IF NOT EXISTS facebook_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    page_id VARCHAR(100) NOT NULL,
    page_name VARCHAR(100) NOT NULL,
    access_token TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, page_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_id VARCHAR(100) NOT NULL,
    sender_id VARCHAR(100) NULL,
    recipient_id VARCHAR(100) NULL,
    message TEXT NOT NULL,
    direction ENUM('incoming', 'outgoing') NOT NULL,
    timestamp INT NOT NULL,
    created_at DATETIME NOT NULL,
    INDEX (page_id),
    INDEX (sender_id),
    INDEX (recipient_id)
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(100) NULL,
    profile_pic VARCHAR(255) NULL,
    last_message TEXT NULL,
    last_message_time INT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX (page_id),
    INDEX (user_id),
    UNIQUE KEY (page_id, user_id)
);

-- Add facebook_id column to users table
ALTER TABLE users ADD COLUMN facebook_id VARCHAR(100) NULL;
