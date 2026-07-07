// ===== UTILITY FUNCTIONS =====
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function showAlert(msg, type = 'success') {
  const existing = $('.alert');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = `alert alert-${type}`;
  div.textContent = msg;
  const target = $('.form-container') || $('.section') || document.body;
  target.prepend(div);
  setTimeout(() => div.remove(), 4000);
}

function formatPrice(p) {
  return '₹' + Number(p).toLocaleString('en-IN');
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let s = '';
  for (let i = 0; i < full; i++) s += '★';
  if (half) s += '⯪';
  s += '☆'.repeat(5 - full - (half ? 1 : 0));
  return s;
}

function getCart() {
  try { return JSON.parse(localStorage.getItem('ath_cart')) || []; } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem('ath_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  $$('.cart-count').forEach(el => el.textContent = count);
}

function updateUserUI() {
  const user = API.getUser();
  $$('.auth-buttons').forEach(el => {
    if (user) {
      el.innerHTML = `<a href="dashboard.html" class="btn btn-outline btn-sm">${user.name}</a>
                      <button class="btn btn-sm btn-danger" onclick="API.logout()">Logout</button>`;
    } else {
      el.innerHTML = `<a href="login.html" class="btn btn-outline btn-sm">Login</a>
                      <a href="register.html" class="btn btn-primary btn-sm">Register</a>`;
    }
  });
  updateCartBadge();
}

// ===== MOBILE NAV =====
document.addEventListener('DOMContentLoaded', () => {
  updateUserUI();
  const toggle = $('.mobile-toggle');
  const nav = $('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }
  // Close nav on link click
  $$('.nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
});

// ===== HOME PAGE =====
function initHome() {
  renderFeaturedProducts();
  renderMandiPreview();
  setupTestimonials();
}

function renderFeaturedProducts() {
  const grid = $('#featured-products .grid');
  if (!grid) return;
  grid.innerHTML = MOCK.products.slice(0, 4).map(p => `
    <div class="card product-card" onclick="viewProduct(${p.id})">
      <img src="${p.image}" alt="${p.name}" class="card-img" loading="lazy">
      <div class="card-body">
        <div class="card-meta">
          <span>👨‍🌾 ${p.farmer}</span>
          <span class="rating">${renderStars(p.rating)} (${p.reviews})</span>
        </div>
        <h3 class="card-title">${p.name}</h3>
        <div class="card-footer">
          <span class="card-price">${formatPrice(p.price)}/${p.unit}</span>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderMandiPreview() {
  const tbody = $('#mandi-preview tbody');
  if (!tbody) return;
  tbody.innerHTML = MOCK.mandiPrices.slice(0, 5).map(m => {
    const trendClass = m.trend === 'up' ? 'price-up' : m.trend === 'down' ? 'price-down' : 'price-stable';
    const arrow = m.trend === 'up' ? '▲' : m.trend === 'down' ? '▼' : '◆';
    return `<tr>
      <td>${m.commodity}</td>
      <td>${m.market}</td>
      <td>${formatPrice(m.minPrice)}</td>
      <td>${formatPrice(m.maxPrice)}</td>
      <td class="${trendClass}">${formatPrice(m.modalPrice)} <small>${arrow}</small></td>
    </tr>`;
  }).join('');
}

function setupTestimonials() {
  const container = $('#testimonials .features-grid');
  if (!container) return;
  const testimonials = [
    { name: 'Rajesh Kumar', role: 'Farmer, Punjab', text: 'AgriTradeHub helped me get fair prices for my produce. No more middlemen!', icon: '👨‍🌾' },
    { name: 'Priya Sharma', role: 'Customer, Delhi', text: 'Fresh farm produce delivered to my doorstep. Amazing quality and prices!', icon: '👩‍💼' },
    { name: 'Amit Singh', role: 'Farmer, Maharashtra', text: 'The mandi price feature helps me decide when and where to sell. Very useful!', icon: '👨‍🌾' }
  ];
  container.innerHTML = testimonials.map(t => `
    <div class="feature-card">
      <div class="feature-icon">${t.icon}</div>
      <h3>${t.name}</h3>
      <p style="font-size:0.85rem;color:#888;margin-bottom:8px">${t.role}</p>
      <p>"${t.text}"</p>
    </div>
  `).join('');
}

function viewProduct(id) {
  window.location.href = `products.html?id=${id}`;
}

// ===== PRODUCT LISTING =====
function initProducts() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    showProductDetail(parseInt(id));
    return;
  }
  renderProducts(MOCK.products);
  setupProductFilters();
}

function renderProducts(products) {
  const grid = $('#product-grid');
  if (!grid) return;
  if (products.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><h3>No products found</h3><p>Try adjusting your search or filters</p></div>`;
    return;
  }
  grid.innerHTML = products.map(p => `
    <div class="card product-card" onclick="viewProduct(${p.id})">
      <img src="${p.image}" alt="${p.name}" class="card-img" loading="lazy">
      <div class="card-body">
        <div class="card-meta">
          <span>👨‍🌾 ${p.farmer}</span>
          <span class="rating">${renderStars(p.rating)} (${p.reviews})</span>
        </div>
        <h3 class="card-title">${p.name}</h3>
        <p class="card-text">${p.description.slice(0, 60)}...</p>
        <div class="card-footer">
          <span class="card-price">${formatPrice(p.price)}/${p.unit}</span>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
}

function setupProductFilters() {
  const search = $('#search-input');
  const category = $('#category-filter');
  const sort = $('#sort-filter');
  if (!search || !category || !sort) return;

  function filterProducts() {
    let filtered = [...MOCK.products];
    const q = search.value.toLowerCase();
    const cat = category.value;
    const s = sort.value;

    if (q) filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) || p.farmer.toLowerCase().includes(q)
    );
    if (cat) filtered = filtered.filter(p => p.category === cat);
    if (s === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (s === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (s === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (s === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

    renderProducts(filtered);
  }

  search.addEventListener('input', filterProducts);
  category.addEventListener('change', filterProducts);
  sort.addEventListener('change', filterProducts);
}

function showProductDetail(id) {
  const p = MOCK.products.find(x => x.id === id);
  const container = $('#product-grid');
  if (!p || !container) return;

  document.title = `${p.name} - AgriTradeHub`;
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;background:var(--bg-white);border-radius:var(--radius);padding:24px;box-shadow:var(--shadow);">
      <div>
        <img src="${p.image}" alt="${p.name}" style="width:100%;border-radius:var(--radius-sm);max-height:400px;object-fit:cover;">
      </div>
      <div>
        <h1 style="font-size:1.8rem;color:var(--primary-dark);margin-bottom:8px;">${p.name}</h1>
        <div class="card-meta" style="margin-bottom:12px">
          <span>👨‍🌾 ${p.farmer}</span>
          <span class="rating">${renderStars(p.rating)} (${p.reviews} reviews)</span>
        </div>
        <p style="margin-bottom:16px;color:var(--text-light);">${p.description}</p>
        <div style="font-size:2rem;font-weight:700;color:var(--primary);margin-bottom:20px;">${formatPrice(p.price)}/${p.unit}</div>
        <div style="margin-bottom:20px;color:var(--text-light);">📦 Stock: ${p.stock} ${p.unit}</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <button class="btn btn-primary btn-lg" onclick="addToCart(${p.id})">🛒 Add to Cart</button>
          <a href="products.html" class="btn btn-outline btn-lg">← Back to Products</a>
        </div>
        <div style="margin-top:24px;">
          <h3 style="margin-bottom:12px;color:var(--primary-dark);">Customer Reviews</h3>
          <div id="product-reviews"></div>
        </div>
      </div>
    </div>
  `;

  const reviewsContainer = $('#product-reviews');
  if (reviewsContainer) {
    reviewsContainer.innerHTML = MOCK.reviews.map(r => `
      <div class="review-card">
        <div class="review-header">
          <span class="review-author">${r.author}</span>
          <span class="review-date">${r.date}</span>
        </div>
        <div class="rating" style="margin-bottom:4px;">${renderStars(r.rating)}</div>
        <p class="review-text">${r.text}</p>
      </div>
    `).join('');
  }
}

// ===== CART =====
function initCart() {
  renderCart();
}

function renderCart() {
  const container = $('#cart-items');
  const summary = $('#cart-summary');
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🛒</div><h3>Your cart is empty</h3><p>Browse products and add items to your cart</p><a href="products.html" class="btn btn-primary" style="margin-top:16px;">Browse Products</a></div>`;
    if (summary) summary.innerHTML = '';
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map(item => {
    const p = MOCK.products.find(x => x.id === item.id);
    if (!p) return '';
    const total = p.price * item.qty;
    subtotal += total;
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}">
        <div class="cart-item-info">
          <h4>${p.name}</h4>
          <p>${formatPrice(p.price)}/${p.unit}</p>
        </div>
        <div class="cart-item-qty">
          <button onclick="updateCartQty(${p.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="updateCartQty(${p.id}, 1)">+</button>
        </div>
        <div class="cart-item-price">${formatPrice(total)}</div>
        <button class="btn btn-danger btn-sm" onclick="removeFromCart(${p.id})">✕</button>
      </div>
    `;
  }).join('');

  if (summary) {
    const shipping = subtotal > 500 ? 0 : 49;
    const total = subtotal + shipping;
    summary.innerHTML = `
      <h3>Order Summary</h3>
      <div class="summary-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${formatPrice(total)}</span></div>
      <button class="btn btn-primary btn-lg btn-block" onclick="checkout()" style="margin-top:20px;">Proceed to Checkout</button>
      <a href="products.html" class="btn btn-outline btn-sm btn-block" style="margin-top:8px;">Continue Shopping</a>
    `;
  }
}

function addToCart(productId) {
  let cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: productId, qty: 1 });
  saveCart(cart);
  showAlert('Item added to cart!', 'success');
  renderCart();
}

function updateCartQty(productId, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== productId);
  saveCart(cart);
  renderCart();
}

function removeFromCart(productId) {
  let cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
  renderCart();
}

function checkout() {
  const user = API.getUser();
  if (!user) {
    showAlert('Please login to checkout', 'error');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }
  const cart = getCart();
  if (cart.length === 0) return;
  showAlert('Order placed successfully! 🎉', 'success');
  localStorage.removeItem('ath_cart');
  updateCartBadge();
  setTimeout(() => window.location.href = 'orders.html', 1500);
}

// ===== ORDERS =====
function initOrders() {
  renderOrders();
}

function renderOrders() {
  const container = $('#orders-list');
  if (!container) return;

  if (MOCK.orders.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><h3>No orders yet</h3><p>Start shopping to see your orders here</p><a href="products.html" class="btn btn-primary" style="margin-top:16px;">Browse Products</a></div>`;
    return;
  }

  container.innerHTML = MOCK.orders.map(o => `
    <div class="order-card">
      <div class="order-header">
        <div>
          <span class="order-id">${o.id}</span>
          <span style="margin-left:12px;font-size:0.9rem;color:var(--text-light);">${o.date}</span>
        </div>
        <span class="order-status status-${o.status}">${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span>
      </div>
      <div class="order-items">
        ${o.items.map(i => `
          <div class="order-item">
            <span>${i.name} × ${i.qty}</span>
            <span>${formatPrice(i.price * i.qty)}</span>
          </div>
        `).join('')}
      </div>
      <div class="order-total">Total: ${formatPrice(o.total)}</div>
    </div>
  `).join('');
}

// ===== LOGIN / REGISTER =====
function initAuth() {
  const loginForm = $('#login-form');
  const registerForm = $('#register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = $('#login-email').value;
      const password = $('#login-password').value;
      try {
        await API.login(email, password);
        showAlert('Login successful!', 'success');
        setTimeout(() => window.location.href = 'index.html', 1000);
      } catch (err) {
        // Use mock login for demo
        const user = MOCK.users.find(u => u.email === email);
        if (user) {
          API.setAuth('mock-token-' + user.id, user);
          showAlert('Login successful!', 'success');
          setTimeout(() => window.location.href = 'index.html', 1000);
        } else {
          showAlert('Invalid email or password', 'error');
        }
      }
    });
  }

  if (registerForm) {
    const roleBtns = $$('.role-toggle button');
    roleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        roleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('#reg-name').value;
      const email = $('#reg-email').value;
      const password = $('#reg-password').value;
      const role = $('.role-toggle .active')?.dataset?.role || 'customer';
      try {
        await API.register({ name, email, password, role });
        showAlert('Registration successful!', 'success');
        setTimeout(() => window.location.href = 'index.html', 1000);
      } catch (err) {
        // Mock registration
        API.setAuth('mock-token-new', { id: Date.now(), name, email, role, avatar: name.split(' ').map(n => n[0]).join('') });
        showAlert('Registration successful!', 'success');
        setTimeout(() => window.location.href = 'index.html', 1000);
      }
    });
  }
}

// ===== DASHBOARD =====
function initDashboard() {
  const user = API.getUser();
  if (!user || user.role !== 'farmer') {
    const content = $('.dashboard-content');
    if (content) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon">🔒</div><h3>Farmer Dashboard</h3><p>Please login as a farmer to access the dashboard</p><a href="login.html" class="btn btn-primary" style="margin-top:16px;">Login as Farmer</a></div>`;
    }
    return;
  }

  renderDashboardStats();
  renderDashboardProducts();
  renderDashboardOrders();
}

function renderDashboardStats() {
  const grid = $('#stats-grid');
  if (!grid) return;
  const s = MOCK.dashboardStats;
  grid.innerHTML = `
    <div class="stat-card"><div class="stat-number">${s.totalProducts}</div><div class="stat-label">Total Products</div></div>
    <div class="stat-card"><div class="stat-number">${s.totalOrders}</div><div class="stat-label">Total Orders</div></div>
    <div class="stat-card"><div class="stat-number">${formatPrice(s.totalRevenue)}</div><div class="stat-label">Total Revenue</div></div>
    <div class="stat-card"><div class="stat-number">${s.avgRating} ★</div><div class="stat-label">Average Rating</div></div>
    <div class="stat-card"><div class="stat-number">${s.pendingOrders}</div><div class="stat-label">Pending Orders</div></div>
    <div class="stat-card"><div class="stat-number">${s.recentOrders}</div><div class="stat-label">This Month</div></div>
  `;
}

function renderDashboardProducts() {
  const tbody = $('#dashboard-products tbody');
  if (!tbody) return;
  const products = MOCK.products.slice(0, 5);
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${formatPrice(p.price)}/${p.unit}</td>
      <td>${p.stock}</td>
      <td>${p.rating} ★</td>
      <td>
        <button class="btn btn-primary btn-sm">Edit</button>
        <button class="btn btn-danger btn-sm">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderDashboardOrders() {
  const container = $('#dashboard-orders-list');
  if (!container) return;
  container.innerHTML = MOCK.orders.map(o => `
    <div class="order-card" style="margin-bottom:12px;">
      <div class="order-header">
        <span class="order-id">${o.id}</span>
        <span class="order-status status-${o.status}">${o.status}</span>
      </div>
      <div style="font-size:0.9rem;color:var(--text-light);">${o.items.length} item(s) · ${formatPrice(o.total)}</div>
    </div>
  `).join('');
}

// ===== MANDI PRICES =====
function initMandiPrices() {
  const tbody = $('#mandi-table tbody');
  if (!tbody) return;
  tbody.innerHTML = MOCK.mandiPrices.map(m => {
    const trendClass = m.trend === 'up' ? 'price-up' : m.trend === 'down' ? 'price-down' : 'price-stable';
    const arrow = m.trend === 'up' ? '▲' : m.trend === 'down' ? '▼' : '◆';
    return `<tr>
      <td>${m.commodity}</td>
      <td>${m.market}</td>
      <td>${m.state}</td>
      <td>${formatPrice(m.minPrice)}</td>
      <td>${formatPrice(m.maxPrice)}</td>
      <td class="${trendClass}">${formatPrice(m.modalPrice)} ${arrow}</td>
    </tr>`;
  }).join('');

  setupMandiFilters();
}

function setupMandiFilters() {
  const search = $('#mandi-search');
  const stateFilter = $('#mandi-state');
  if (!search || !stateFilter) return;

  function filterMandi() {
    const q = search.value.toLowerCase();
    const state = stateFilter.value;
    let filtered = [...MOCK.mandiPrices];
    if (q) filtered = filtered.filter(m => m.commodity.toLowerCase().includes(q));
    if (state) filtered = filtered.filter(m => m.state === state);

    const tbody = $('#mandi-table tbody');
    if (!tbody) return;
    tbody.innerHTML = filtered.map(m => {
      const trendClass = m.trend === 'up' ? 'price-up' : m.trend === 'down' ? 'price-down' : 'price-stable';
      const arrow = m.trend === 'up' ? '▲' : m.trend === 'down' ? '▼' : '◆';
      return `<tr>
        <td>${m.commodity}</td>
        <td>${m.market}</td>
        <td>${m.state}</td>
        <td>${formatPrice(m.minPrice)}</td>
        <td>${formatPrice(m.maxPrice)}</td>
        <td class="${trendClass}">${formatPrice(m.modalPrice)} ${arrow}</td>
      </tr>`;
    }).join('');
  }

  search.addEventListener('input', filterMandi);
  stateFilter.addEventListener('change', filterMandi);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  else if (page === 'products') initProducts();
  else if (page === 'cart') initCart();
  else if (page === 'orders') initOrders();
  else if (page === 'auth') initAuth();
  else if (page === 'dashboard') initDashboard();
  else if (page === 'mandi') initMandiPrices();
});
