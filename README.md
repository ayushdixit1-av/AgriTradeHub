# 🌾 AgriTradeHub

> **Farm-to-Market Digital Marketplace** — Connecting farmers directly with buyers for fair pricing, transparency, and quality produce.

[![GitHub Pages](https://img.shields.io/badge/hosted-on%20GitHub%20Pages-brightgreen)](https://ayushdixit1-av.github.io/AgriTradeHub/)
[![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=fff)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=fff)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Pages & Screens](#-pages--screens)
- [Data Model](#-data-model)
- [User Flows](#-user-flows)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 📌 Overview

AgriTradeHub is a full-stack digital marketplace designed to eliminate intermediaries in agricultural trade. It empowers farmers with:

- **Direct access** to consumers for fair pricing
- **Real-time mandi prices** for informed selling decisions
- **Role-based access** for farmers and buyers
- **Secure transactions** with order tracking

```mermaid
mindmap
  root((AgriTradeHub))
    Farmers
      List Products
      Set Prices
      Manage Orders
      View Mandi Prices
    Buyers
      Browse Products
      Shopping Cart
      Place Orders
      Leave Reviews
    Platform
      User Auth
      Product Catalog
      Order Management
      Real-time Prices
```

---

## 🏗 Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend (Static)"]
        HTML["HTML5<br/>Semantic Pages"]
        CSS["CSS3<br/>Custom Properties + Grid/Flexbox"]
        JS["JavaScript<br/>Vanilla JS + Local Storage"]
    end

    subgraph Pages["Application Pages"]
        LANDING["Landing Page<br/>index.html"]
        AUTH["Auth<br/>login.html / register.html"]
        PRODUCTS["Products<br/>products.html"]
        CART["Cart<br/>cart.html"]
        ORDERS["Orders<br/>orders.html"]
        DASHBOARD["Dashboard<br/>dashboard.html"]
        MANDI["Mandi Prices<br/>mandi-prices.html"]
    end

    subgraph Services["Service Layer"]
        API["api.js<br/>API Client + Mock Data"]
        MAIN["main.js<br/>UI Logic + Event Handlers"]
    end

    subgraph Storage["Data Layer"]
        LS["localStorage<br/>Cart + Auth Tokens"]
        MOCK["Mock Data<br/>Products, Orders, Prices"]
        BACKEND["Backend API<br/>(Future Integration)"]
    end

    HTML --> LANDING
    HTML --> AUTH
    HTML --> PRODUCTS
    HTML --> CART
    HTML --> ORDERS
    HTML --> DASHBOARD
    HTML --> MANDI

    MAIN --> API
    API --> LS
    API --> MOCK
    API -.-> BACKEND

    LANDING --> MAIN
    AUTH --> MAIN
    PRODUCTS --> MAIN
    CART --> MAIN
    ORDERS --> MAIN
    DASHBOARD --> MAIN
    MANDI --> MAIN
```

---

## ✨ Features

```mermaid
quadrantChart
    title Feature Priority Matrix
    x-axis Low Impact --> High Impact
    y-axis Low Effort --> High Effort
    quadrant-1 High Effort, High Impact
    quadrant-2 High Impact, Low Effort
    quadrant-3 Low Impact, Low Effort
    quadrant-4 Low Impact, High Effort
    Product Listing: [0.7, 0.3]
    User Auth: [0.5, 0.2]
    Shopping Cart: [0.6, 0.4]
    Mandi Prices: [0.8, 0.5]
    Farmer Dashboard: [0.9, 0.6]
    Order Tracking: [0.7, 0.5]
    Reviews & Ratings: [0.4, 0.3]
    Responsive Design: [0.3, 0.2]
```

| Feature | Description |
|---------|-------------|
| 🔐 **User Authentication** | Login/Register with role selection (Farmer/Buyer) |
| 📦 **Product Management** | List, search, filter, and sort farm products |
| 🛒 **Shopping Cart** | Add/remove items, quantity control, order summary |
| 📋 **Order Management** | Track order status (pending → shipped → delivered) |
| 📊 **Farmer Dashboard** | Stats, product table, recent orders overview |
| 📈 **Mandi Prices** | Real-time market price data with trends (▲▼◆) |
| ⭐ **Reviews & Ratings** | Customer feedback on products |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |

---

## 🛠 Tech Stack

```mermaid
pie title Tech Stack Distribution
    "HTML5" : 35
    "CSS3" : 30
    "JavaScript" : 35
```

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Markup** | HTML5 | Semantic structure, SEO-friendly |
| **Styling** | CSS3 | Custom properties, Grid, Flexbox, responsive |
| **Logic** | Vanilla JavaScript | DOM manipulation, state management |
| **Storage** | localStorage | Cart persistence, auth tokens |
| **Hosting** | GitHub Pages | Static site deployment |

---

## 📄 Pages & Screens

```mermaid
flowchart LR
    A["📱 User Visits Site"] --> B{Has Account?}
    B -->|No| C["Register<br/>register.html"]
    B -->|Yes| D["Login<br/>login.html"]
    C --> D
    D --> E["🏠 Home<br/>index.html"]
    
    E --> F["Browse Products<br/>products.html"]
    E --> G["View Mandi Prices<br/>mandi-prices.html"]
    
    F --> H["Product Detail<br/>products.html?id=X"]
    H --> I["Add to Cart"]
    I --> J["🛒 Cart<br/>cart.html"]
    
    J --> K["Checkout"]
    K --> L["📋 Orders<br/>orders.html"]
    
    E --> M["👨‍🌾 Farmer Dashboard<br/>dashboard.html"]
```

| Page | Route | Purpose |
|------|-------|---------|
| 🏠 **Home** | `index.html` | Hero, featured products, mandi preview, testimonials |
| 🔑 **Login** | `login.html` | Email/password auth with demo credentials |
| 📝 **Register** | `register.html` | Buyer/Farmer role selection |
| 📦 **Products** | `products.html` | Product grid + detail view with reviews |
| 🛒 **Cart** | `cart.html` | Cart items, quantity, order summary |
| 📋 **Orders** | `orders.html` | Order history with status badges |
| 📊 **Dashboard** | `dashboard.html` | Farmer stats, products table, orders |
| 📈 **Mandi Prices** | `mandi-prices.html` | Live market prices with filters |

---

## 💾 Data Model

```mermaid
erDiagram
    User ||--o{ Product : lists
    User ||--o{ Order : places
    User {
        int id PK
        string name
        string email
        string role "farmer | customer"
        string avatar
    }
    
    Product ||--o{ Review : has
    Product {
        int id PK
        string name
        string farmer
        float price
        string unit "kg | litre | bundle"
        string category "grains | fruits | vegetables | oils | spices | dairy"
        int stock
        string description
        float rating
        int reviews
        string image
    }
    
    Order ||--o{ OrderItem : contains
    Order {
        string id PK "ORD-2024-001"
        date date
        string status "pending | confirmed | shipped | delivered | cancelled"
        float total
    }
    
    OrderItem {
        string name
        int qty
        float price
    }
    
    Review {
        int id PK
        string author
        int rating
        string text
        date date
    }
    
    MandiPrice {
        string commodity
        string market
        string state
        float minPrice
        float maxPrice
        float modalPrice
        string trend "up | down | stable"
    }
```

---

## 🔄 User Flows

### Buyer Flow

```mermaid
sequenceDiagram
    actor Buyer
    participant Site as AgriTradeHub
    participant Cart as Cart
    participant Orders as Orders

    Buyer->>Site: Browse products
    Site->>Buyer: Show product grid
    Buyer->>Site: Filter/Search products
    Site->>Buyer: Display filtered results
    Buyer->>Site: View product details
    Buyer->>Cart: Add to cart
    Buyer->>Cart: Adjust quantities
    Buyer->>Cart: Proceed to checkout
    Cart->>Orders: Create order
    Orders->>Buyer: Confirm order
    Buyer->>Orders: Track order status
```

### Farmer Flow

```mermaid
sequenceDiagram
    actor Farmer
    participant Auth as Auth
    participant Dashboard
    participant Products
    participant Orders

    Farmer->>Auth: Login as Farmer
    Auth->>Dashboard: Redirect to dashboard
    Farmer->>Dashboard: View stats (revenue, orders, ratings)
    Farmer->>Products: List new product
    Products->>Dashboard: Product appears in table
    Farmer->>Dashboard: View incoming orders
    Farmer->>Orders: Update order status
    Farmer->>Dashboard: Monitor performance
```

### Mandi Price Check Flow

```mermaid
flowchart TD
    START["🌾 Farmer wants to sell"] --> MP["Open Mandi Prices Page"]
    MP --> SEARCH["Search commodity"]
    SEARCH --> FILTER["Filter by state"]
    FILTER --> COMPARE{"Compare prices"}
    COMPARE -->|Higher in other mandi| TRANSPORT["Consider transport costs"]
    COMPARE -->|Best in local mandi| DECIDE["Sell in local market"]
    TRANSPORT --> DECIDE
    DECIDE --> LIST["List product on AgriTradeHub"]
    LIST --> PROFIT["💰 Better profit!"]
```

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/ayushdixit1-av/AgriTradeHub.git

# Navigate to project directory
cd AgriTradeHub

# Open with live server (VS Code extension recommended)
# Right-click index.html → Open with Live Server

# Or simply open in browser
start index.html     # Windows
open index.html      # macOS
xdg-open index.html  # Linux
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👨‍🌾 Farmer | `rajesh@farm.com` | any password |
| 👤 Customer | `priya@buyer.com` | any password |

---

## 🌐 Deployment

The site is deployed on **GitHub Pages**:

👉 **[https://ayushdixit1-av.github.io/AgriTradeHub/](https://ayushdixit1-av.github.io/AgriTradeHub/)**

To deploy your own fork:
1. Go to repo **Settings → Pages**
2. Set source to **main branch** (root folder)
3. Wait 1-2 minutes for build
4. Access `https://<username>.github.io/AgriTradeHub/`

---

## 🤝 Contributing

```mermaid
gitGraph
    commit id: "initial"
    branch feat-auth
    commit id: "auth-ui"
    commit id: "auth-logic"
    checkout main
    merge feat-auth
    branch feat-products
    commit id: "product-grid"
    commit id: "filters"
    checkout main
    merge feat-products
    branch feat-cart
    commit id: "cart-ui"
    commit id: "checkout"
    checkout main
    merge feat-cart
    branch feat-dashboard
    commit id: "farmer-dash"
    checkout main
    merge feat-dashboard
```

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📬 Contact

- **Email:** support@agritradehub.in
- **Phone:** +91-1800-123-AGRI
- **Location:** New Delhi, India

---

<p align="center">
  Made with ❤️ for Indian Farmers<br/>
  <strong>Empowering Farmers, Enriching Lives</strong>
</p>
