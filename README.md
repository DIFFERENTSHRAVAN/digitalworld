# Digital World - Complete E-Commerce Web Application

**Digital World** is a production-oriented e-commerce platform built for an electronics retail store and second-hand laptop specialist in India, owned by **Vishal Soni**.

---

## 🌟 Key Highlights & Features

1. **Dual-Mode Backend Architecture:**
   - **Local Development / Demo Mode (Default):** Runs immediately out of the box with zero external dependencies using a persistent local mock database. All cart additions, stock checks, atomic order submissions, order lookup, and admin CRUD actions work right now.
   - **Supabase Live Mode:** Connects to Supabase PostgreSQL, Supabase Auth, and Row-Level Security (RLS) policies by simply adding two environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).

2. **Certified Second-Hand Laptop Diagnostics:**
   - Dedicated inspection fields for pre-owned laptops: Processor, RAM, SSD capacity, Screen size, Graphics, Battery Health percentage, Physical condition grade (Grade A / B), Inspected defects report, and Included accessories.
   - Transparent honesty: Missing fields display "Not provided" rather than fabricated specifications.
   - One-click "Mark as Reserved" and "Mark as Sold" toggles in the admin dashboard.

3. **WhatsApp Ordering & Notifications:**
   - **Product-Level Inquiry:** "Order on WhatsApp" opens a prefilled message with product title, brand, model, price, and shareable product URL.
   - **Cart-Level Inquiry:** "Send Cart Inquiry to WhatsApp" formats all items, quantities, and estimated subtotal.
   - **Owner Notification Link:** Formats full order details (Order ID, customer address, payment method, line items, and timestamp) for dispatch.
   - **Customer Status Updates:** Admin can notify customers on WhatsApp with 1 click when order status changes (Confirmed, Processing, Shipped, Delivered).

4. **Honest Indian Pricing & Checkout:**
   - Indian Rupee (₹) formatting with lakhs/thousands comma separators.
   - Validates 10-digit Indian mobile numbers (`^[6-9]\d{9}$`) and 6-digit postal PIN codes (`^[1-9][0-9]{5}$`).
   - Separate, clearly explained payment choices:
     * **Cash on Delivery (COD):** Pay cash to courier upon package arrival.
     * **Pay on Delivery:** Pay via UPI QR code (Google Pay, PhonePe, Paytm) or Cash at doorstep.
     * **Online Payment Gateway:** Transparently marked as disabled until real payment gateway keys are configured by the owner.
   - Server-side stock deduction and price re-calculation to prevent browser tampering.

5. **Shop Owner Administration Portal:**
   - Protected route (`/admin`) with login at `/admin/login`.
   - Real metrics: Total orders, today's orders, pending reviews, active revenue, and low-stock alerts.
   - Full product CRUD with custom specifications and used laptop diagnostics.
   - CSV export of inventory.
   - **1-Click "Purge Demo Inventory"** button so Vishal Soni can easily wipe sample demo products before store launch.
   - Editable Store Settings: Shop name, owner name, WhatsApp number, call number, shop address, email, operating hours, delivery fees, free delivery threshold, and policy terms.

6. **Bilingual Support (English & Hindi):**
   - Instant language toggle in the top navigation between English and हिन्दी.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 3.4
- **Icons:** Lucide React
- **Animations / Celebrations:** Canvas-Confetti
- **Backend / Database:** Supabase (PostgreSQL + RLS) or Local Storage Engine
- **Routing:** React Router v7 with SPA rewrites

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
cd soni-electronics
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. The app runs in **Local Development Mode** automatically.

### 3. Admin Login Credentials (Demo Mode)
- **URL:** `http://localhost:5173/admin/login`
- **Email:** `admin@sonielectronics.com`
- **Password:** `admin123`

---

## 🗄️ Supabase Live Database Setup

When you are ready to connect a live cloud database:

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the Supabase Project Dashboard, go to **Project Settings** -> **API**.
3. Copy the **Project URL** and the **anon public API Key**.

### Step 2: Run Database Schema and Seeds
1. Open the **SQL Editor** in your Supabase Dashboard.
2. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
   - This creates all tables (`store_settings`, `categories`, `products`, `orders`, `order_items`, `order_status_history`, `notification_logs`), enables Row Level Security (RLS), and deploys the `create_order_atomic` stored procedure.
3. Copy the contents of [`supabase/seed.sql`](./supabase/seed.sql) and click **Run** to seed categories and initial data.

### Step 3: Update `.env`
Update `.env` in the project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### Step 4: Restart Development Server or Re-build
```bash
npm run build
```
The app will automatically detect your Supabase credentials and transition from Local Storage Mode to live PostgreSQL!

---

## 📋 Pre-Launch Checklist for Vishal Soni

Before public launch, the shop owner should complete these steps in the Admin Dashboard:

1. [ ] **Set WhatsApp Number:** Go to `/admin` -> **Business Settings** and enter your 10-digit Indian mobile number (e.g., `919876543210`).
2. [ ] **Set Shop Address & Phone:** Enter physical shop address, call number, and business hours.
3. [ ] **Configure Delivery Fees:** Set standard delivery charge (e.g. ₹99) and free delivery order threshold (e.g. ₹1,999).
4. [ ] **Review Payment Toggles:** Verify Cash on Delivery (COD) and Pay on Delivery are enabled as desired.
5. [ ] **Purge Demo Inventory:** Click the **"Purge Demo Inventory"** button in `/admin` to remove sample test laptops and components.
6. [ ] **Add Real Shop Stock:** Use the **"Add Product"** or **"Add Inspected Laptop"** forms to list actual laptops with real photos and exact diagnostics.

---

## 📦 Deployment Instructions

### Deploy to Vercel
1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Framework Preset: **Vite**.
4. Set Environment Variables if connecting Supabase:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. SPA routing rewrites are already configured via [`vercel.json`](./vercel.json).

### Deploy to Cloudflare Pages
1. In the Cloudflare Dashboard, go to **Workers & Pages** -> **Create application** -> **Pages**.
2. Connect your Git repository.
3. Build Settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables if applicable.
5. Deploy. SPA redirects are pre-configured via [`public/_redirects`](./public/_redirects).

---

## 🔒 Security & Privacy Guarantees

- **No Hardcoded Secrets:** No Supabase service-role keys or sensitive API tokens are embedded in frontend bundles.
- **Customer Privacy:** Order lookups require both the Order Number and the matching mobile phone number.
- **Stock Protection:** Atomic validation ensures items marked as sold out or reserved cannot be ordered.
- **Price Integrity:** Order totals and line-item prices are recalculated server-side / store-side upon checkout.
