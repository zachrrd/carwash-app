# 🖥️ Car Wash Web Applications (Frontend Portals)

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO_Client-4.x-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Midtrans](https://img.shields.io/badge/Midtrans-Snap_SDK-002B49?style=for-the-badge)](https://midtrans.com/)

> **Modern, responsive single-page web applications (SPA)** built with React 18, Vite, and Tailwind CSS. The web frontend consists of two distinct, purpose-built portals: **Back-Office Admin & Cashier Dashboard** and **Customer Self-Service Booking Portal**.

---

## 🏛️ Web Portals Overview

```
frontend/
├── admin/                     # Back-Office Admin & Cashier Management Portal
│   ├── src/
│   │   ├── components/        # Layout, Navbar, Sidebar, Dashboard widgets, shadcn/ui
│   │   ├── pages/             # Orders, Payments, Customers, Vehicles, Services, Staff, Invoices
│   │   ├── services/          # Axios API services & Socket.io listeners
│   │   └── routes/            # Protected route guards by role
│   └── package.json
│
└── customer/                  # Customer Facing Booking & Live Tracking Portal
    ├── src/
    │   ├── components/        # Landing banner, order stepper, booking forms
    │   ├── context/           # AuthContext & real-time order state
    │   ├── pages/             # Landing, Services Catalog, Create Order, Live Status, Invoices
    │   └── services/          # Midtrans Snap integration & Axios API client
    └── package.json
```

---

## 🏢 1. Admin & Cashier Portal (`frontend/admin`)

Portal back-office komprehensif bagi pemilik bisnis, supervisor, dan staf kasir untuk mengelola seluruh aspek operasional cuci mobil secara tersentralisasi.

### Fitur Utama:
- **Live Antrean Kendaraan**: Menampilkan antrean aktif cuci mobil secara real-time via **Socket.IO** (otomatis bertambah saat ada booking baru tanpa perlu refresh halaman).
- **Manajemen Alur Kerja & Penugasan Staf**: Mengubah tahapan cuci (`CONFIRMED` ➔ `IN_PROGRESS` ➔ `COMPLETED`) serta menetapkan staf pencuci mobil yang bertugas.
- **Kasir & Pelunasan Pembayaran**: Menerima pembayaran kasir tunai (dengan kalkulator kembalian otomatis) maupun verifikasi pembayaran digital (QRIS, Transfer).
- **Katalog Layanan & Media Cloud**: Mengatur paket cuci, harga, estimasi durasi, dan mengunggah gambar promosi layanan yang terintegrasi dengan **ImageKit CDN**.
- **Database Pelanggan & Armada Mobil**: Pencatatan riwayat kendaraan, plat nomor, dan histori transaksi pelanggan setia.
- **Trash & Soft-Delete Recovery**: Memulihkan data master (layanan, pelanggan, staf, mobil) yang terhapus secara tidak sengaja melalui fitur tong sampah (*trash*).

---

## 👤 2. Customer Portal (`frontend/customer`)

Portal web interaktif bagi pelanggan untuk melakukan reservasi layanan cuci mobil, bertransaksi secara *cashless*, dan memantau progres pencucian kendaraan secara langsung.

### Fitur Utama:
- **Katalog Layanan Interaktif**: Pelanggan dapat melihat rincian paket cuci mobil, fasilitas, harga, dan estimasi waktu pengerjaan.
- **Booking Pesanan Mandiri**: Memilih jenis kendaraan, menentukan paket cuci, serta memilih opsi pembayaran.
- **Integrasi Pembayaran Midtrans Snap**:
  - Pelanggan dapat langsung membayar secara digital menggunakan QRIS (GoPay, OVO, Dana, ShopeePay), Virtual Account BCA/Mandiri/BRI/BNI, atau Kartu Kredit.
  - Callback otomatis mendeteksi ketika pembayaran berhasil diselesaikan.
- **Live Progress Tracker (Real-Time)**:
  - Pelanggan dapat memantau status mobil mereka secara langsung:
    `Menunggu Antrean` ➔ `Mobil Sedang Dicuci` ➔ `Selesai & Siap Diambil`.
  - Didukung koneksi WebSocket Socket.IO room `order:{id}`.
- **Riwayat Transaksi & Unduh Faktur**: Mengakses riwayat pemesanan masa lalu dan mengunduh invoice digital.

---

## 🛠️ Panduan Menjalankan Web Apps

### 1. Menjalankan Admin Portal
```bash
cd frontend/admin

# Install dependencies
npm install

# Setup environment
cp .env.example .env
```

Pastikan variabel di `.env` sudah benar:
```env
VITE_API_URL="http://localhost:5000/api"
VITE_SOCKET_URL="http://localhost:5000"
```

Jalankan server development:
```bash
npm run dev
```
> Admin portal akan aktif di `http://localhost:5173`.

---

### 2. Menjalankan Customer Portal
Buka tab terminal baru:
```bash
cd frontend/customer

# Install dependencies
npm install

# Setup environment
cp .env.example .env
```

Pastikan variabel di `.env` sudah benar:
```env
VITE_API_URL="http://localhost:5000/api"
VITE_SOCKET_URL="http://localhost:5000"
```

Jalankan server development:
```bash
npm run dev
```
> Customer portal akan aktif di `http://localhost:5174` (atau port Vite berikutnya).

---

## 👨‍💻 Maintainer
**Zacharia** - [@zachrrd](https://github.com/zachrrd)
Repository: [carwash-app](https://github.com/zachrrd/carwash-app)
