-- AI Travel Planner & Expense Optimizer
-- MySQL schema and sample data
-- Generated: 2026-07-03

-- DROP existing objects (safe for dev). Uncomment when needed.
-- DROP DATABASE IF EXISTS aitours;
-- CREATE DATABASE aitours CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE aitours;

SET FOREIGN_KEY_CHECKS = 0;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_start (user_id, start_date),
  CONSTRAINT fk_trips_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  trip_id BIGINT UNSIGNED NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  description VARCHAR(500),
  spent_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_spent (user_id, spent_at),
  KEY idx_trip (trip_id),
  CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_expenses_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI History table
CREATE TABLE IF NOT EXISTS aihistory (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  type ENUM('tripPlanner','packingList','budgetOptimizer','chatAssistant') NOT NULL,
  input_payload JSON NOT NULL,
  response_text LONGTEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_type (user_id, type),
  CONSTRAINT fk_aihistory_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Sample data
-- Users
INSERT INTO users (name, email, password_hash, role, created_at)
VALUES
  ('Alice Traveler', 'alice@example.com', '$2b$12$EXAMPLEHASH1111111111111111111111111111111111111', 'user', NOW()),
  ('Bob Planner', 'bob@example.com', '$2b$12$EXAMPLEHASH2222222222222222222222222222222222222', 'user', NOW()),
  ('Admin User', 'admin@example.com', '$2b$12$EXAMPLEHASH3333333333333333333333333333333333333', 'admin', NOW());

-- Trips
INSERT INTO trips (user_id, title, destination, start_date, end_date, budget, notes, created_at)
VALUES
  (1, 'Weekend in Lisbon', 'Lisbon, Portugal', '2026-08-12', '2026-08-15', 1200.00, 'Focus on food and history', NOW()),
  (1, 'Ski Trip', 'Chamonix, France', '2026-12-20', '2026-12-27', 3000.00, 'Skiing + mountain hikes', NOW()),
  (2, 'Tokyo Culture Tour', 'Tokyo, Japan', '2026-10-05', '2026-10-14', 4000.00, 'Temples and food markets', NOW());

-- Expenses
INSERT INTO expenses (user_id, trip_id, category, amount, currency, description, spent_at, created_at)
VALUES
  (1, 1, 'Accommodation', 450.00, 'EUR', 'Hotel near downtown', '2026-08-12 15:30:00', NOW()),
  (1, 1, 'Food', 120.50, 'EUR', 'Local restaurants and snacks', '2026-08-13 20:00:00', NOW()),
  (1, 2, 'Transport', 200.00, 'EUR', 'Train pass', '2026-12-21 09:00:00', NOW()),
  (2, 3, 'Accommodation', 900.00, 'JPY', 'Hotel Shinjuku', '2026-10-05 14:00:00', NOW()),
  (2, NULL, 'Equipment', 75.00, 'USD', 'Travel gear not related to trip', '2026-06-15 10:00:00', NOW());

-- AI History
INSERT INTO aihistory (user_id, type, input_payload, response_text, created_at)
VALUES
  (1, 'tripPlanner', JSON_OBJECT('destination', 'Lisbon', 'budget', 1200, 'days', 3, 'interests', 'food, history'), 'Sample itinerary: Day 1... Day 2... Day 3...', NOW()),
  (1, 'packingList', JSON_OBJECT('destination', 'Chamonix', 'season', 'winter'), 'Packing: skis, warm jacket, gloves...', NOW()),
  (2, 'chatAssistant', JSON_OBJECT('question', 'Best time to visit Tokyo?'), 'The best time is spring for cherry blossoms or autumn for pleasant weather.', NOW());

-- Helpful indexes for reporting
CREATE INDEX idx_expenses_category ON expenses (category);
CREATE INDEX idx_trips_destination ON trips (destination);

-- End of schema
