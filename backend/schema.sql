-- AgriTradeHub Database Schema
-- Run this in Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('farmer', 'customer')),
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  farmer TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'kg',
  category TEXT,
  stock INT DEFAULT 0,
  description TEXT,
  image TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  reviews INT DEFAULT 0,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  date TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mandi prices table
CREATE TABLE IF NOT EXISTS mandi_prices (
  id SERIAL PRIMARY KEY,
  commodity TEXT NOT NULL,
  market TEXT NOT NULL,
  state TEXT,
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  modal_price DECIMAL(10,2),
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed mandi prices
INSERT INTO mandi_prices (commodity, market, state, min_price, max_price, modal_price, trend) VALUES
  ('Wheat', 'Azadpur Mandi', 'Delhi', 2150, 2450, 2300, 'up'),
  ('Rice (Paddy)', 'Mandi Gobindgarh', 'Punjab', 1950, 2250, 2100, 'stable'),
  ('Potato', 'Agra Mandi', 'UP', 850, 1100, 950, 'down'),
  ('Onion', 'Lasalgaon', 'Maharashtra', 1450, 1750, 1600, 'up'),
  ('Tomato', 'Kolar', 'Karnataka', 1200, 1600, 1400, 'down'),
  ('Mustard', 'Alwar', 'Rajasthan', 4800, 5200, 5000, 'up'),
  ('Sugarcane', 'Muzaffarnagar', 'UP', 3400, 3700, 3550, 'stable'),
  ('Groundnut', 'Gondal', 'Gujarat', 5200, 5600, 5400, 'up'),
  ('Maize', 'Gulabbagh', 'Bihar', 1750, 2050, 1900, 'stable'),
  ('Cotton', 'Sirsa', 'Haryana', 6100, 6500, 6300, 'down')
ON CONFLICT DO NOTHING;
