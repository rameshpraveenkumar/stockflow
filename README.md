# STOCKFLOW

**Inventory Management Software for Retailers**

STOCKFLOW is a responsive, self-contained frontend web application and SaaS marketing site designed for general retailers, supermarkets, grocery stores, and specialty merchants. It pairs seven public product, marketing, and authentication pages with an interactive eight-module retail operations dashboard backed by browser storage.

---

## Project Overview

Built with semantic HTML5, localized Tailwind CSS, custom CSS (`css/styles.css`), and modular Vanilla JavaScript, STOCKFLOW runs completely offline without external CDN dependencies. All vendor libraries (`tailwindcss.js`, `lucide.min.js`, `chart.umd.min.js`), Google Font binaries (`Plus Jakarta Sans` and `Inter`), and product/store photography are bundled locally inside `assets/`.

---

## Main Website Pages

1. **`index.html` — Home 1 (Marketing Landing Page):** Introduces STOCKFLOW (*"Take Control of Every Shelf. Grow With Confidence."*) with a split hero, interactive before/after floor comparison, retail problem statements, core capability highlights, software previews, 4-stage workflow, and 5-column footer.
2. **`home-2.html` — Home 2 (Editorial Photographic Hero):** Full-width photographic hero (*"Your Entire Inventory. One Powerful Dashboard."*) with directional scrim contrast overlay, compact value highlights, floor-bottleneck metrics, alternating product showcases, and core module links.
3. **`about.html` — About Us:** Covers retail inventory bottlenecks (*"Built for Retailers Who Refuse to Run Out of Stock"*), spreadsheet vs. enterprise ERP comparisons, core differentiators, and operational storage environments.
4. **`features.html` — Features:** Deep dive into inventory tracking, SKU catalog management, purchase orders and stock receiving, low-stock alerts, supplier directories, valuation reports, and category organization.
5. **`pricing.html` — Pricing Plans:** Interactive Monthly / Annual billing toggle, tiered subscription comparison table, and expandable FAQ accordion.
6. **`login.html` — Sign In Portal:** Split-screen authentication view with store photography, role selector (`Store Manager` / `Store Associate`), password visibility toggle, and demo session handling.
7. **`register.html` — Workspace Registration:** Split-screen sign-up preview with store name validation, live password strength indicator, password confirmation matching, and local profile preview persistence.

---

## Dashboard Modules (`dashboard/`)

1. **`dashboard/index.html` — Dashboard Overview:** Live inventory KPI cards, inflow/outflow and category breakdowns powered by Chart.js, low-stock alerts preview, recent purchase orders, and quick global topbar search.
2. **`dashboard/products.html` — Products Management:** SKU catalog preloaded with 28 sample retail items, category/stock filters, column sorting, pagination, add/edit modal CRUD, stock count adjustments, and CSV export.
3. **`dashboard/categories.html` — Categories Management:** 6 seeded retail departments with automatic SKU counts, add/edit modal forms, and delete checks for assigned products.
4. **`dashboard/suppliers.html` — Suppliers Directory:** Preloaded directory of 6 suppliers with contact records, CRUD modals, and a slide-over/modal purchase order history view.
5. **`dashboard/purchase-orders.html` — Purchase Orders:** Multi-item purchase order builder across Draft, Pending, Partially Received, Received, and Cancelled states, including receiving workflows that update SKU stock quantities.
6. **`dashboard/stock-alerts.html` — Stock Alerts:** Automated low-stock and out-of-stock threshold monitoring with quick stock audits and one-click purchase order generation.
7. **`dashboard/reports.html` — Reports & Analytics:** Interactive Chart.js visualizations for inventory valuation, category shares, top SKUs by stock value, and CSV valuation exports.
8. **`dashboard/settings.html` — Settings & Preferences:** Store profile configuration, threshold/appearance preferences (Light/Dark theme and LTR/RTL layout), JSON workspace backup export, and one-click reset to sample defaults.

---

## Key Features

- **Dark & Light Theme (`js/theme.js`):** Instant toggle persisted in `localStorage` (`stockflow_theme`) with system preference fallback and zero-flash initialization, plus `?test_theme=dark` query override.
- **RTL & LTR Support (`js/direction.js`):** Instant direction switching persisted in `localStorage` (`stockflow_dir`) via `dir="rtl"` / `dir="ltr"`, mirrored directional gradients, logical padding utilities, and `?test_dir=rtl` override.
- **Role-Aware Demo UI (`js/auth.js`, `js/dashboard.js`):** Switch between `Store Manager (Admin)` and `Store Associate (User)` on login or inside the dashboard profile menu.
- **Client-Side Store Persistence (`js/data.js`):** Pre-seeded retail inventory dataset (28 products, 6 categories, 6 suppliers, 5 purchase orders) persisted in `localStorage`.
- **100% Self-Contained Offline Bundle:** All Tailwind, Lucide, Chart.js, font `.woff2` files, and photography assets are stored locally with zero external runtime requests.

---

## Technologies Used

- **Markup & Styling:** HTML5, CSS3 (`css/styles.css`), Tailwind CSS (localized runtime bundle in `assets/vendor/tailwindcss.js`)
- **Scripting:** Vanilla JavaScript (ES6+) modular scripts under `js/`
- **Icons & Charts:** Lucide Icons (`assets/vendor/lucide.min.js`), Chart.js v4.4.4 (`assets/vendor/chart.umd.min.js`)
- **Typography:** Self-hosted `Plus Jakarta Sans` and `Inter` via `assets/vendor/fonts.css` and `assets/vendor/fonts/*.woff2`
- **State Persistence:** Browser `localStorage` and `sessionStorage`

---

## Project Folder Structure

```text
stockflow/
├── index.html                   # Public Home 1 marketing landing page
├── home-2.html                  # Public Home 2 photographic hero landing page
├── about.html                   # Company & mission overview
├── features.html                # Feature breakdown & interactive previews
├── pricing.html                 # Subscription tiers, billing toggle & FAQs
├── login.html                   # Split-screen retailer demo sign-in portal
├── register.html                # Workspace registration preview form
├── README.md                    # Project documentation
├── image-sources.txt            # Photography & vendor license attributions
├── .gitignore                   # Git exclusion rules
├── css/
│   └── styles.css               # Design tokens, custom hero/login styles & RTL utilities
├── js/
│   ├── auth.js                  # Demo session handling, registration validation & toasts
│   ├── categories.js            # Category CRUD & product count checks
│   ├── dashboard.js             # Shared sidebar drawer, search, notifications & role switcher
│   ├── data.js                  # Seeded DataStore repository & receiving logic
│   ├── direction.js             # LTR/RTL toggle & persistence
│   ├── main.js                  # Public header dropdown, mobile menu, FAQs & billing toggle
│   ├── products.js              # Product CRUD, filtering, sorting & CSV export
│   ├── purchase-orders.js       # Multi-line PO creation & receiving workflow
│   ├── reports.js               # Chart.js valuation & analytics rendering
│   ├── settings.js              # Store preferences, backup JSON export & data reset
│   ├── stock-alerts.js          # Threshold triggers & 1-click reorder actions
│   ├── suppliers.js             # Supplier directory & order history viewer
│   └── theme.js                 # Light/Dark theme persistence
├── dashboard/
│   ├── index.html               # Dashboard overview hub
│   ├── products.html            # Master SKU catalog management
│   ├── categories.html          # Department & category management
│   ├── suppliers.html           # Supplier directory
│   ├── purchase-orders.html     # Purchase order lifecycle & receiving
│   ├── stock-alerts.html        # Low-stock & critical stockout alerts
│   ├── reports.html             # Inventory valuation & analytics
│   └── settings.html            # Store settings, appearance & reset controls
└── assets/
    ├── images/                  # Retail store photography, product thumbnails & dashboard previews
    └── vendor/                  # Local Tailwind CSS, Lucide, Chart.js & WOFF2 font files
```

---

## Running Locally

Because STOCKFLOW uses static HTML, CSS, JavaScript, and local `assets/`, no build step or package installation is required. Run any lightweight static web server from the project root so relative URLs, `localStorage`, and Chart.js canvases operate under a clean `http://localhost` origin:

### Option 1: Python (Recommended)

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/index.html` in your browser.

### Option 2: Node.js (`serve` or `http-server`)

```bash
npx serve -l 8080 .
```

Or:

```bash
npx http-server -p 8080
```

Then open `http://localhost:8080/index.html` in your browser.

### Option 3: VS Code Live Server

Open the repository folder in VS Code and click **Go Live** on `index.html`.

---

## Demo Login Instructions

Open `login.html` to sign in using the interactive demo portal:

- **Pre-filled Store Manager (`Admin`) Account:**
  - **Email:** `retailer@stockflow.demo`
  - **Password:** `retail123` *(any password with 4 or more characters is accepted for local demo sign-in)*
- **Store Associate (`User`) Role:**
  - Click **Store Associate** in the Workspace Role selector (`associate@stockflow.demo` auto-populates) with any 4+ character password.
- **Registration Preview (`register.html`):**
  - Validates full name, store name, unique email (excluding the two reserved demo addresses), password strength (8+ characters), and confirmation match, saving a non-password workspace profile preview to `localStorage` (`stockflow_demo_registrations`).
- **Direct Dashboard Access:**
  - Opening any `dashboard/*.html` page directly without prior login automatically initializes a temporary `Store Manager (Admin)` session (`retailer@stockflow.demo`) in `sessionStorage` so reviewers can explore the dashboard immediately.

---

## Current Limitations (Frontend-Only Prototype)

- **No Backend Server or Cloud Database:** All inventory changes, purchase orders, suppliers, and settings persist only in the local browser's `localStorage` and `sessionStorage`. Clearing browser storage or using a different browser/device reverts to the default sample dataset.
- **Simulated Authentication & Registration:** `login.html` and `register.html` provide client-side UI validation and session simulation only. Real account registration, encrypted password hashing, OAuth providers, and server-side email password resets are not implemented (`Auth` intentionally avoids storing plaintext passwords).
- **Non-Enforced Role Security:** Switching between `Store Manager (Admin)` and `Store Associate (User)` demonstrates role indicators and workspace state transitions on the frontend without server-side authorization or access control enforcement.
- **Client-Side Forms & Exports:** Public contact/briefing subscription forms show interactive toast confirmations only; reports and backups download directly in the browser as `.csv` / `.json` files.
