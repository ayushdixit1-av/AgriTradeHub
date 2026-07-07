const API = {
  BASE: localStorage.getItem('ath_api_url') || 'https://agritradehub-api.onrender.com/api',
  TOKEN_KEY: 'ath_token',
  USER_KEY: 'ath_user',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  getUser() {
    const u = localStorage.getItem(this.USER_KEY);
    return u ? JSON.parse(u) : null;
  },

  setAuth(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  headers(extra = {}) {
    const h = { 'Content-Type': 'application/json', ...extra };
    const t = this.getToken();
    if (t) h['Authorization'] = `Bearer ${t}`;
    return h;
  },

  async request(method, path, body = null) {
    const opts = { method, headers: this.headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${this.BASE}${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  get(path) { return this.request('GET', path); },
  post(path, body) { return this.request('POST', path, body); },
  put(path, body) { return this.request('PUT', path, body); },
  del(path) { return this.request('DELETE', path); },

  // Auth
  async login(email, password) {
    const data = await this.post('/auth/login', { email, password });
    this.setAuth(data.token, data.user);
    return data.user;
  },

  async register(userData) {
    const data = await this.post('/auth/register', userData);
    this.setAuth(data.token, data.user);
    return data.user;
  },

  logout() {
    this.clearAuth();
    window.location.href = 'index.html';
  },

  // Products
  async getProducts(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.get(`/products${q ? '?' + q : ''}`);
  },

  async getProduct(id) {
    return this.get(`/products/${id}`);
  },

  async createProduct(product) {
    return this.post('/products', product);
  },

  async updateProduct(id, product) {
    return this.put(`/products/${id}`, product);
  },

  async deleteProduct(id) {
    return this.del(`/products/${id}`);
  },

  // Cart
  async getCart() {
    return this.get('/cart');
  },

  async addToCart(productId, quantity = 1) {
    return this.post('/cart', { productId, quantity });
  },

  async updateCartItem(productId, quantity) {
    return this.put('/cart', { productId, quantity });
  },

  async removeFromCart(productId) {
    return this.del(`/cart/${productId}`);
  },

  // Orders
  async placeOrder(orderData) {
    return this.post('/orders', orderData);
  },

  async getOrders() {
    return this.get('/orders');
  },

  async getOrder(id) {
    return this.get(`/orders/${id}`);
  },

  async updateOrderStatus(id, status) {
    return this.put(`/orders/${id}/status`, { status });
  },

  // Reviews
  async getReviews(productId) {
    return this.get(`/products/${productId}/reviews`);
  },

  async addReview(productId, review) {
    return this.post(`/products/${productId}/reviews`, review);
  },

  // Mandi Prices
  async getMandiPrices(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.get(`/mandi${q ? '?' + q : ''}`);
  },

  // Dashboard
  async getDashboardStats() {
    return this.get('/dashboard/stats');
  },

  async getMyProducts() {
    return this.get('/dashboard/products');
  },

  async getMyOrders() {
    return this.get('/dashboard/orders');
  }
};

// Demo/Mock data for frontend showcase
const MOCK = {
  users: [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@farm.com', role: 'farmer', avatar: 'RK' },
    { id: 2, name: 'Priya Sharma', email: 'priya@buyer.com', role: 'customer', avatar: 'PS' }
  ],
  products: [
    { id: 1, name: 'Organic Basmati Rice', farmer: 'Rajesh Kumar', price: 85, unit: 'kg', rating: 4.5, reviews: 24, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop', category: 'grains', stock: 500, description: 'Premium quality organic basmati rice grown in the foothills of Himalayas.' },
    { id: 2, name: 'Fresh Alphonso Mangoes', farmer: 'Rajesh Kumar', price: 120, unit: 'kg', rating: 4.8, reviews: 36, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop', category: 'fruits', stock: 200, description: 'Sweet and juicy Alphonso mangoes straight from the farm.' },
    { id: 3, name: 'Green Vegetables Bundle', farmer: 'Priya Sharma', price: 45, unit: 'bundle', rating: 4.3, reviews: 18, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop', category: 'vegetables', stock: 300, description: 'Freshly harvested seasonal green vegetables.' },
    { id: 4, name: 'Cold Pressed Mustard Oil', farmer: 'Rajesh Kumar', price: 210, unit: 'litre', rating: 4.6, reviews: 42, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop', category: 'oils', stock: 150, description: 'Pure cold-pressed mustard oil with authentic flavor.' },
    { id: 5, name: 'Organic Turmeric Powder', farmer: 'Priya Sharma', price: 180, unit: 'kg', rating: 4.4, reviews: 29, image: 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=400&h=300&fit=crop', category: 'spices', stock: 100, description: 'Pure organic turmeric powder with high curcumin content.' },
    { id: 6, name: 'Fresh Cow Milk', farmer: 'Rajesh Kumar', price: 56, unit: 'litre', rating: 4.7, reviews: 51, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop', category: 'dairy', stock: 400, description: 'Fresh farm cow milk, delivered daily.' },
    { id: 7, name: 'Raw Honey - Pure', farmer: 'Priya Sharma', price: 350, unit: 'kg', rating: 4.9, reviews: 67, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop', category: 'others', stock: 80, description: '100% pure raw honey, unprocessed and unfiltered.' },
    { id: 8, name: 'Fresh Tomatoes', farmer: 'Rajesh Kumar', price: 35, unit: 'kg', rating: 4.2, reviews: 15, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop', category: 'vegetables', stock: 600, description: 'Vine-ripened fresh tomatoes, perfect for cooking.' }
  ],
  orders: [
    { id: 'ORD-2024-001', date: '2024-12-15', status: 'delivered', items: [{ name: 'Organic Basmati Rice', qty: 5, price: 85 }, { name: 'Fresh Alphonso Mangoes', qty: 2, price: 120 }], total: 665 },
    { id: 'ORD-2024-002', date: '2024-12-18', status: 'shipped', items: [{ name: 'Cold Pressed Mustard Oil', qty: 2, price: 210 }], total: 420 },
    { id: 'ORD-2024-003', date: '2024-12-22', status: 'pending', items: [{ name: 'Green Vegetables Bundle', qty: 3, price: 45 }, { name: 'Organic Turmeric Powder', qty: 1, price: 180 }], total: 315 }
  ],
  mandiPrices: [
    { commodity: 'Wheat', market: 'Azadpur Mandi', state: 'Delhi', minPrice: 2150, maxPrice: 2450, modalPrice: 2300, trend: 'up' },
    { commodity: 'Rice (Paddy)', market: 'Mandi Gobindgarh', state: 'Punjab', minPrice: 1950, maxPrice: 2250, modalPrice: 2100, trend: 'stable' },
    { commodity: 'Potato', market: 'Agra Mandi', state: 'UP', minPrice: 850, maxPrice: 1100, modalPrice: 950, trend: 'down' },
    { commodity: 'Onion', market: 'Lasalgaon', state: 'Maharashtra', minPrice: 1450, maxPrice: 1750, modalPrice: 1600, trend: 'up' },
    { commodity: 'Tomato', market: 'Kolar', state: 'Karnataka', minPrice: 1200, maxPrice: 1600, modalPrice: 1400, trend: 'down' },
    { commodity: 'Mustard', market: 'Alwar', state: 'Rajasthan', minPrice: 4800, maxPrice: 5200, modalPrice: 5000, trend: 'up' },
    { commodity: 'Sugarcane', market: 'Muzaffarnagar', state: 'UP', minPrice: 3400, maxPrice: 3700, modalPrice: 3550, trend: 'stable' },
    { commodity: 'Groundnut', market: 'Gondal', state: 'Gujarat', minPrice: 5200, maxPrice: 5600, modalPrice: 5400, trend: 'up' },
    { commodity: 'Maize', market: 'Gulabbagh', state: 'Bihar', minPrice: 1750, maxPrice: 2050, modalPrice: 1900, trend: 'stable' },
    { commodity: 'Cotton', market: 'Sirsa', state: 'Haryana', minPrice: 6100, maxPrice: 6500, modalPrice: 6300, trend: 'down' }
  ],
  reviews: [
    { id: 1, author: 'Amit S.', rating: 5, text: 'Excellent quality rice! Very aromatic and tastes great. Will order again.', date: '2024-12-10' },
    { id: 2, author: 'Neha P.', rating: 4, text: 'Good product. Delivery was on time. Packaging could be better.', date: '2024-12-08' },
    { id: 3, author: 'Vikram R.', rating: 5, text: 'Best mangoes I have had this season! Highly recommended.', date: '2024-12-05' },
    { id: 4, author: 'Sunita K.', rating: 4, text: 'Fresh vegetables. Good value for money.', date: '2024-12-03' }
  ],
  dashboardStats: {
    totalProducts: 12,
    totalOrders: 45,
    totalRevenue: 28500,
    avgRating: 4.5,
    recentOrders: 8,
    pendingOrders: 3
  }
};
