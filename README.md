# 🚗 Car Wash Management System (Sistem Manajemen Cuci Mobil End-to-End)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express 5](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![React Native](https://img.shields.io/badge/React_Native-Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Midtrans](https://img.shields.io/badge/Midtrans-Payment_Gateway-002B49?style=for-the-badge)](https://midtrans.com/)

> **An enterprise-grade, omnichannel car wash management platform** that bridges back-office administration, customer self-service booking with automated payment gateways, and on-the-ground operational staff via real-time mobile app tracking.

---

## 📌 Executive Summary & Architecture Overview

**Car Wash Management System** memadukan seluruh alur bisnis operasional cuci mobil modern dalam satu ekosistem terpadu:
1. **Penerimaan & Booking Pesanan**: Customer dapat memilih jenis layanan cuci mobil, mendaftarkan kendaraan, dan membayar secara instan melalui payment gateway Midtrans (QRIS, VA, Transfer) atau kasir.
2. **Koordinasi Lapangan Real-Time**: Staf operasional menerima antrean cuci mobil secara *real-time* via **Mobile App**, melakukan inspeksi kendaraan, mengambil tugas (*multi-staff assignment*), dan memperbarui tahapan cuci (`WAITING` ➔ `CONFIRMED` ➔ `IN_PROGRESS` ➔ `COMPLETED`).
3. **Pengawasan & Keuangan Sentral**: Administrator & kasir memantau status antrean aktif, arus kas pembayaran, laporan penjualan, hingga *soft-delete recovery* (trash) melalui **Admin Dashboard**.
4. **Sinkronisasi Instan**: Menggunakan WebSockets (**Socket.IO**) sehingga setiap perubahan status langsung terkirim serentak ke aplikasi Customer, Mobile Staff, dan Admin tanpa reload.

```
                              ┌────────────────────────────────────────┐
                              │      Cloud Media & Payment Infra       │
                              │  [ImageKit CDN]      [Midtrans Snap]   │
                              └───────────────────▲────────────────────┘
                                                  │ Webhooks & Media API
                                                  ▼
┌──────────────────────┐               ┌──────────────────────┐               ┌──────────────────────┐
│  Customer Web App    │               │  Backend API Engine  │               │   Mobile Staff App   │
│  (React 18 + Vite)   │ ◄──WebSocket─►│ (Express 5+TS+Prisma)│ ◄──WebSocket─►│ (React Native+Expo)  │
│  - Self Booking      │ ◄────REST────►│ - Auth & RBAC (JWT)  │ ◄────REST────►│ - Order Queue        │
│  - Midtrans Payment  │               │ - Socket.IO Rooms    │               │ - Status Progress    │
│  - Live Order Status │               │ - PDF Invoicing      │               │ - Staff Assignment   │
└──────────────────────┘               └──────────▲───────────┘               └──────────────────────┘
                                                  │
                                       WebSocket & REST API
                                                  │
                                       ┌──────────▼───────────┐
                                       │   Admin Web Portal   │
                                       │  (React 18 + Vite)   │
                                       │ - Live Queue Monitor │
                                       │ - Cash & POS Settle  │
                                       │ - Trash & Analytics  │
                                       └──────────────────────┘
```

---

## 🗂️ Ecosystem Repositories & Modules

Project ini terbagi dalam 3 sub-sistem utama yang dapat dijalankan secara independen ataupun sebagai monorepo:

| Folder / Repo | Komponen | Deskripsi & Tech Stack |
|---|---|---|
| [`/backend`](./backend) | **Core REST & WebSocket API** | Express 5, TypeScript, Prisma ORM, PostgreSQL, Socket.IO, Midtrans SDK, PDFKit, ImageKit. |
| [`/frontend`](./frontend) | **Web Portals (Admin & Customer)** | Dual React 18 + Vite apps: **Admin/Cashier Dashboard** dan **Customer Self-Service Portal**. |
| [`/mobile`](./mobile) | **Floor & Staff Mobile App** | React Native, Expo Router, NativeWind (Tailwind), SecureStore, PDF Print & Share. |

---

## ✨ Key Technical Highlights

### 1. Real-Time Bidirectional Event Streaming
- Menggunakan **Socket.IO** dengan authentication handshake berbasis JWT.
- Channel isolasi berbasis room:
  - `orders`: Room internal khusus `ADMIN` dan `CASHIER` untuk menerima event instan `new-order`, `order-status-updated`, dan `order-paid`.
  - `order:{id}`: Room spesifik per nomor transaksi sehingga customer dan staf pelaksana dapat berkoordinasi secara aman dan terlindungi.

### 2. Automated Payment Gateway & Webhook Reconciliation
- Integrasi resmi dengan **Midtrans Snap API**: Menghasilkan transaction token secara dinamis untuk pembayaran digital (QRIS, BCA/Mandiri/BRI Virtual Account, E-Wallet).
- **Atomic Webhook Verification**: Memvalidasi SHA-512 Signature Hash dari Midtrans Notification, menjalankan transaksi database atomik via `prisma.$transaction`:
  - Mengupdate status `orders` menjadi `PAID` / `CONFIRMED`.
  - Mencatat mutasi di tabel `payments`.
  - Menerbitkan faktur elektronik di tabel `invoices`.
  - Menyiarkan event real-time ke mobile app dan dashboard admin.

### 3. Role-Based Access Control (RBAC) & Security
- 3 tingkat otorisasi peran sistem: `ADMIN`, `CASHIER`, `CUSTOMER`.
- Middleware token verification berbasis JWT (`auth.middleware.ts` & `role.middleware.ts`).
- Route guards terenkapsulasi baik di web frontend (Protected Routes) maupun di mobile app navigation stack.

### 4. Enterprise Resilience: Soft-Deletes & Trash Management
- Entitas vital (`customers`, `staffs`, `vehicles`, `services`) mengimplementasikan pola arsitektur **Soft-Delete** (`deleted_at`).
- Mencegah *orphan records* dan kerusakan integritas relasi foreign-key.
- Dilengkapi dengan fitur **Trash & Restore** pada Admin Dashboard untuk pemulihan data operasional secara aman.

### 5. Multi-Staff Assignment & Digital Invoicing
- Satu antrean cuci mobil dapat ditugaskan ke lebih dari satu teknisi lapangan (*many-to-many* relasi `order_staff`).
- Pembuatan struk dan invoice berformat PDF resolusi tinggi langsung di-generate oleh backend (`PDFKit`) dan dapat langsung dicetak / dibagikan via WhatsApp/Bluetooth Printer via Mobile App (`expo-print` & `expo-sharing`).

---

## 🛠️ Tech Stack Matrix

| Layer | Technologies |
|---|---|
| **Backend** | Node.js, Express v5, TypeScript, Prisma v7, PostgreSQL (`pg`), Zod validation, Multer |
| **Realtime** | Socket.IO v4 (WebSockets with fallback polling) |
| **Payment Gateway** | Midtrans Client (Snap API + Webhook Notification Handler) |
| **Cloud Media** | ImageKit Node SDK (Upload, transformation, & CDN delivery) |
| **Web Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Axios, Sonner / Toast |
| **Mobile Frontend** | React Native 0.86, Expo SDK 57, Expo Router, NativeWind v4, Expo Secure Store, Expo Print |
| **Document Engine** | PDFKit (Backend invoice generator) & Expo Sharing (Mobile dispatch) |

---

## 🚀 Quick Start Guide (Local Development)

### Prasyarat Sistem
- **Node.js**: Versi `>= 18.x` (Direkomendasikan Node 20 LTS)
- **PostgreSQL**: Versi `>= 14`
- **npm** atau **pnpm**
- **Expo Go App** (di smartphone Android/iOS) untuk pengujian mobile

---

### 1. Clone Repository
```bash
git clone https://github.com/zachrrd/carwash-app.git
cd carwash-app
```

---

### 2. Backend Setup
Masuk ke direktori `backend`, pasang dependencies, siapkan konfigurasi `.env`, dan migrasikan database:

```bash
cd backend
npm install

# Salin konfigurasi environment
cp .env.example .env
```

Sesuaikan nilai di `.env`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/carwash_db?schema=public"
JWT_SECRET="supersecretkey123"
CUSTOMER_FE_URL="http://localhost:5173"
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxx"
MIDTRANS_IS_PRODUCTION=false
```

Jalankan migrasi database dan seeding data awal:
```bash
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts

# Jalankan server backend
npm run dev
```
> Server backend akan aktif di `http://localhost:5000` dengan WebSocket siap melayani koneksi.

---

### 3. Frontend Web Setup

#### A. Admin & Cashier Dashboard
```bash
cd ../frontend/admin
npm install
cp .env.example .env
npm run dev
```
> Dashboard Admin akan terbuka di `http://localhost:5173`.

#### B. Customer Portal
```bash
cd ../frontend/customer
npm install
cp .env.example .env
npm run dev
```
> Portal Customer akan terbuka di port Vite berikutnya (misal `http://localhost:5174`).

---

### 4. Mobile Staff & Floor App Setup
```bash
cd ../../mobile
npm install
cp .env.example .env
```

Pastikan nilai `EXPO_PUBLIC_API_URL` dan `EXPO_PUBLIC_SOCKET_URL` mengarah ke IP lokal komputer Anda (jangan gunakan `localhost` jika dijalankan di HP fisik):
```env
EXPO_PUBLIC_API_URL="http://192.168.1.100:5000/api"
EXPO_PUBLIC_SOCKET_URL="http://192.168.1.100:5000"
```

Jalankan Expo development server:
```bash
npx expo start
```
Scan QR code menggunakan aplikasi **Expo Go** di Android atau kamera iOS.

---

## 📁 Monorepo Structure

```text
carwash-app/
├── backend/                  # REST API & WebSocket Server
│   ├── prisma/               # Database Schema, Migrations, & Seed data
│   ├── src/
│   │   ├── config/           # Prisma, Midtrans, ImageKit, & Socket configs
│   │   ├── controllers/      # Request handlers (Auth, Order, Payment, etc.)
│   │   ├── middlewares/      # JWT, Role Guard, Upload, Socket Auth
│   │   ├── routes/           # REST Route definitions
│   │   ├── services/         # Business logic & 3rd-party services
│   │   └── index.ts          # Express & HTTP/Socket.IO Server entry
│   ├── package.json
│   └── README.md
│
├── frontend/                 # Web Applications
│   ├── admin/                # Back-Office Admin & Cashier SPA (Vite + React)
│   ├── customer/             # Customer Self-Booking & Order Tracker SPA (Vite + React)
│   └── README.md
│
├── mobile/                   # Floor Operations App (React Native + Expo)
│   ├── app/                  # Expo Router file-based pages (auth, tabs, order, invoice)
│   ├── services/             # Axios client, SecureStore, Socket.io listener
│   ├── components/           # Reusable mobile UI components
│   ├── package.json
│   └── README.md
│
├── package.json              # Monorepo root helper scripts
├── .gitignore                # Global workspace ignore rules
└── PRD_Carwash_App.pdf       # Original Product Requirement Document
```

---

## 🔒 Security & Data Hygiene
- **Sanitized Repository**: Berkas kredensial lokal (`.env`), cache editor AI (`.agents`, `.claude`, `.windsurf`), dan build artifacts sepenuhnya di-ignore dari public git history.
- **Payload Validation**: Seluruh data masuk divalidasi ketat menggunakan schema validator untuk mencegah *malformed requests* atau SQL injection.
- **Midtrans Signature Verification**: Webhook Midtrans wajib lolos kalkulasi hash `SHA512(order_id + status_code + gross_amount + ServerKey)` sebelum mengubah status pembayaran.

---

## 👨‍💻 Author & Maintainer

**Zacharia**
- GitHub: [@zachrrd](https://github.com/zachrrd)
- Project Repository: [carwash-app](https://github.com/zachrrd/carwash-app)

---

## 📄 License
This project is distributed under the **MIT License**.
