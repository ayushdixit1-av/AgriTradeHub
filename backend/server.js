require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  family: 4
});

pool.query('SELECT NOW()', (err) => {
  if (err) console.error('DB CONNECTION FAILED:', err.message);
  else console.log('DB connected successfully');
});

const JWT_SECRET = process.env.JWT_SECRET || 'agritradehub-secret-key-change-in-production';

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token provided' });
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header) {
    try {
      req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    } catch {}
  }
  next();
};

// ==================== HEALTH ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== AUTH ====================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role, avatar)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, avatar`,
      [name, email, hash, role || 'customer', avatar]
    );
    const user = rows[0];
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const user = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      role: rows[0].role,
      avatar: rows[0].avatar
    };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, avatar FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ==================== PRODUCTS ====================
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let sql = `SELECT p.*, u.name as farmer_name, u.avatar as farmer_avatar
               FROM products p JOIN users u ON p.user_id = u.id WHERE 1=1`;
    const params = [];
    let paramIdx = 0;

    if (category) {
      paramIdx++;
      params.push(category);
      sql += ` AND p.category = $${paramIdx}`;
    }
    if (search) {
      paramIdx++;
      params.push(`%${search}%`);
      sql += ` AND (p.name ILIKE $${paramIdx} OR u.name ILIKE $${paramIdx})`;
    }

    switch (sort) {
      case 'price-low': sql += ' ORDER BY p.price ASC'; break;
      case 'price-high': sql += ' ORDER BY p.price DESC'; break;
      case 'rating': sql += ' ORDER BY p.rating DESC'; break;
      case 'name': sql += ' ORDER BY p.name ASC'; break;
      default: sql += ' ORDER BY p.created_at DESC';
    }

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Products fetch error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.name as farmer_name, u.avatar as farmer_avatar
       FROM products p JOIN users u ON p.user_id = u.id WHERE p.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Product fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/products', auth, async (req, res) => {
  try {
    const { name, price, unit, category, stock, description, image } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO products (name, farmer, price, unit, category, stock, description, image, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, req.user.name, price, unit || 'kg', category, stock || 0, description, image, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Product create error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.put('/api/products/:id', auth, async (req, res) => {
  try {
    const { name, price, unit, category, stock, description, image } = req.body;
    const { rows } = await pool.query(
      `UPDATE products SET name=$1, price=$2, unit=$3, category=$4, stock=$5,
       description=$6, image=$7 WHERE id=$8 AND user_id=$9 RETURNING *`,
      [name, price, unit, category, stock, description, image, req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found or unauthorized' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Product update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.delete('/api/products/:id', auth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM products WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) return res.status(404).json({ message: 'Product not found or unauthorized' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Product delete error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ==================== CART ====================
app.get('/api/cart', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.unit, p.image, p.stock
       FROM cart c JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Cart fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/cart', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const existing = await pool.query(
      'SELECT id, quantity FROM cart WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );
    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE cart SET quantity = quantity + $1 WHERE id = $2',
        [quantity, existing.rows[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [req.user.id, productId, quantity]
      );
    }
    const { rows } = await pool.query(
      `SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.unit, p.image
       FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Cart add error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.put('/api/cart', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (quantity <= 0) {
      await pool.query(
        'DELETE FROM cart WHERE user_id = $1 AND product_id = $2',
        [req.user.id, productId]
      );
    } else {
      await pool.query(
        'UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3',
        [quantity, req.user.id, productId]
      );
    }
    const { rows } = await pool.query(
      `SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.unit, p.image
       FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Cart update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.delete('/api/cart/:productId', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM cart WHERE user_id = $1 AND product_id = $2',
      [req.user.id, req.params.productId]
    );
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Cart delete error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ==================== ORDERS ====================
app.post('/api/orders', auth, async (req, res) => {
  try {
    const { items, total } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ message: 'Order must contain items' });
    }
    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
    await pool.query(
      'INSERT INTO orders (id, user_id, items, total, status) VALUES ($1, $2, $3, $4, $5)',
      [orderId, req.user.id, JSON.stringify(items), total, 'pending']
    );
    await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
    res.status(201).json({ id: orderId, status: 'pending', total });
  } catch (err) {
    console.error('Order create error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/orders', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );
    res.json(rows.map(o => ({ ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items })));
  } catch (err) {
    console.error('Orders fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/orders/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    const order = { ...rows[0], items: typeof rows[0].items === 'string' ? JSON.parse(rows[0].items) : rows[0].items };
    res.json(order);
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.put('/api/orders/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Order status error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ==================== REVIEWS ====================
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, u.name as author, u.avatar as author_avatar
       FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Reviews fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/products/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, text } = req.body;
    if (!rating || !text) {
      return res.status(400).json({ message: 'Rating and text are required' });
    }
    const { rows } = await pool.query(
      'INSERT INTO reviews (product_id, user_id, rating, text) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.id, req.user.id, rating, text]
    );
    const avg = await pool.query(
      'SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = $1',
      [req.params.id]
    );
    await pool.query(
      'UPDATE products SET rating = $1, reviews = $2 WHERE id = $3',
      [avg.rows[0].avg_rating, parseInt(avg.rows[0].count), req.params.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Review create error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ==================== MANDI PRICES ====================
app.get('/api/mandi', async (req, res) => {
  try {
    const { commodity, state } = req.query;
    let sql = 'SELECT * FROM mandi_prices WHERE 1=1';
    const params = [];
    let idx = 0;

    if (commodity) {
      idx++;
      params.push(`%${commodity}%`);
      sql += ` AND commodity ILIKE $${idx}`;
    }
    if (state) {
      idx++;
      params.push(state);
      sql += ` AND state = $${idx}`;
    }

    sql += ' ORDER BY commodity ASC';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Mandi fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ==================== DASHBOARD ====================
app.get('/api/dashboard/stats', auth, async (req, res) => {
  try {
    const products = await pool.query(
      'SELECT COUNT(*)::int FROM products WHERE user_id = $1',
      [req.user.id]
    );
    const allOrders = await pool.query(
      `SELECT COUNT(*)::int as count, COALESCE(SUM(total), 0)::float as revenue
       FROM orders WHERE user_id = $1`,
      [req.user.id]
    );
    const avgRating = await pool.query(
      `SELECT COALESCE(AVG(rating), 0)::float as avg FROM products WHERE user_id = $1`,
      [req.user.id]
    );
    const pendingOrders = await pool.query(
      `SELECT COUNT(*)::int FROM orders WHERE user_id = $1 AND status IN ('pending', 'confirmed')`,
      [req.user.id]
    );

    res.json({
      totalProducts: parseInt(products.rows[0].count),
      totalOrders: parseInt(allOrders.rows[0].count),
      totalRevenue: parseFloat(allOrders.rows[0].revenue),
      avgRating: parseFloat(avgRating.rows[0].avg).toFixed(1),
      pendingOrders: parseInt(pendingOrders.rows[0].count)
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/dashboard/products', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Dashboard products error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/dashboard/orders', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY date DESC LIMIT 10',
      [req.user.id]
    );
    res.json(rows.map(o => ({ ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items })));
  } catch (err) {
    console.error('Dashboard orders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AgriTradeHub API running on port ${PORT}`);
});
