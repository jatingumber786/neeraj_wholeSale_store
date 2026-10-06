# Wholesale E-Commerce Ordering System (MERN + Google Sheets)
**Version 1.0** | **Prepared for: Jatin Gumber**

A complete, production-ready wholesale e-commerce platform designed for bulk ordering, dealer inventory management, and instantaneous write-through to a fixed Google Sheet with automatic daily worksheet generation (`DD-MM-YYYY`).

---

## 🌟 Key Features & Requirements Coverage

| SRS Requirement | Feature Description | Implementation Status |
| :--- | :--- | :---: |
| **FR-1 Customer Authentication** | Google Sign-In & Mobile OTP verification via Firebase, plus quick demo accounts | ✅ Completed |
| **FR-2 Product Catalog** | Search, category filtering, wholesale units, stock badges, quantity stepper | ✅ Completed |
| **FR-3 Shopping Cart** | Bulk quantity updates, item subtotals, min order quantity enforcement, subtotal | ✅ Completed |
| **FR-4 Delivery Address** | Name, phone, street, city, state, ZIP with multiple saved addresses | ✅ Completed |
| **FR-5 Place Order** | Stock validation, sequential Order ID (#1001, #1002), MongoDB save, instant Google Sheet append | ✅ Completed |
| **FR-6 Dealer Login** | Secure dealer authentication via credentials or 6-digit PIN | ✅ Completed |
| **FR-7 Product Management** | Add, edit, delete wholesale products, upload images, adjust stock count | ✅ Completed |
| **FR-8 Inventory Control** | In Stock, Low Stock (<10), and Out of Stock protection with one-click toggles | ✅ Completed |
| **FR-9 Google Sheet Automation** | Auto-creates today's worksheet (`DD-MM-YYYY`) and appends rows instantly | ✅ Completed |
| **FR-10 Dealer Dashboard** | Real-time metrics: today's orders, revenue, inventory alerts, and live sheet feed | ✅ Completed |

---

## 🏗 System Architecture

```text
       Customer / Dealer Browser
                  │
        React 18 + Tailwind CSS (Vite)
                  │
        Node.js + Express REST API
         ├──────────────────────────┐
         │                          │
   MongoDB Atlas            Google Sheets API (v4)
 (Users, Products, Orders)          │
                        Daily Worksheet (e.g. 06-10-2026)
                        Row: Order ID | Time | Customer | Phone | Product | Qty | Address | ZIP
```

---

## 📊 Google Sheet Row Format (Section 4)

| Order ID | Time | Customer | Phone | Product | Qty | Address | ZIP |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `1001` | `10:15` | `Rahul` | `9811223344` | `Basmati Rice Premium (25kg)` | `2` | `Shop 12, Main Mandi, Delhi` | `110001` |
| `1002` | `10:22` | `Jatin` | `9988776655` | `Refined Mustard Oil Tin (15L)` | `12` | `GT Road Wholesale Market, Panipat` | `132103` |

* A new worksheet with title `DD-MM-YYYY` (e.g. `06-10-2026`) is created automatically every day on the first order of the day.
* If live Google API credentials are not yet entered, the system operates in **Simulation Mode**, recording orders to a local virtual worksheet with zero downtime.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (Node.js 24 LTS is configured on this system)
- **MongoDB**: MongoDB Atlas URI (or uses automatic in-memory DB out-of-the-box)

### 2. Run the Full Stack with 1 Command
Run the PowerShell launcher in the root directory:
```powershell
.\run-dev.ps1
```
Or start each service manually:

#### Backend
```powershell
cd backend
npm run dev
# Running on http://localhost:5000
```

#### Frontend
```powershell
cd frontend
npm run dev
# Running on http://localhost:5173
```

---

## 🔑 Demo & Test Credentials

You can test both customer and dealer workflows instantly using the built-in demo accounts:

### Dealer Portal Access
* **Email:** `dealer@wholesale.com`
* **Password:** `dealer123`
* **Quick PIN:** `123456`

### Customer Test Accounts
* **Customer 1:** Rahul (Delhi) - `9811223344`
* **Customer 2:** Jatin (Panipat) - `9988776655`
* **OTP for testing:** `123456`

---

## 📋 Google Sheets Service Account Setup (FR-9)

To connect your live Google Sheet:
1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable the **Google Sheets API**.
3. Under **IAM & Admin > Service Accounts**, create a Service Account.
4. Click on the Service Account, go to **Keys > Add Key > Create New Key (JSON)**, and download the key.
5. Create a Google Spreadsheet in your Google Drive and copy the Spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`
6. Click **Share** on your Google Spreadsheet and add your Service Account email as **Editor**.
7. In `backend/.env`, set:
   ```env
   GOOGLE_SHEET_ID=your_spreadsheet_id_here
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project-id.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
8. In the Dealer Portal, navigate to **Google Sheets Automation** and click **Test Google Sheet Connection**.

---

## 🗄 Database Schemas

### `User`
* `name`: String
* `email`: String (unique/sparse)
* `phone`: String (unique/sparse)
* `role`: `'customer'` | `'dealer'`
* `addresses`: Array of `{ name, phone, street, city, state, zip, isDefault }`
* `firebaseUid`: String

### `Product`
* `name`: String
* `category`: String
* `price`: Number (Wholesale rate)
* `stock`: Number (Available inventory)
* `unit`: String (e.g., `25kg bag`, `15L tin`, `50kg sack`)
* `minOrderQty`: Number (Default 1)
* `outOfStock`: Boolean
* `image`: String
* `description`: String

### `Order`
* `orderId`: String (Sequential: 1001, 1002, ...)
* `customerId`: ObjectId (ref User)
* `customerName`: String
* `customerPhone`: String
* `items`: Array of `{ product, name, price, quantity, unit, subtotal }`
* `address`: String
* `city`: String
* `state`: String
* `zip`: String
* `totalAmount`: Number
* `status`: `'placed'` | `'confirmed'` | `'dispatched'` | `'delivered'`
* `sheetSynced`: Boolean
* `sheetSyncedAt`: Date

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/google` | Google / Firebase Sign-In | Public |
| `POST` | `/api/auth/phone` | Mobile OTP Login | Public |
| `POST` | `/api/auth/dealer-login` | Secure Dealer Login | Public |
| `GET` | `/api/auth/me` | Current user profile | Token |
| `POST` | `/api/auth/address` | Add delivery address | Token |
| `GET` | `/api/products` | Browse catalog with search/filter | Public |
| `POST` | `/api/products` | Add new wholesale product | Dealer |
| `PATCH` | `/api/products/:id` | Update product / stock / out-of-stock | Dealer |
| `DELETE`| `/api/products/:id` | Delete product | Dealer |
| `POST` | `/api/orders` | Place bulk order & append to Sheet | Public / Token |
| `GET` | `/api/orders/today` | Fetch today's orders feed | Dealer |
| `GET` | `/api/orders/my-orders`| Fetch customer's order history | Public / Token |
| `GET` | `/api/orders/stats` | Dashboard statistics & alerts | Dealer |
| `GET` | `/api/sheets/info` | Sheet connection status & metadata | Public |
| `POST` | `/api/sheets/test` | Test live Google Sheets connection | Dealer |
