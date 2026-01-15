# Project-Based Learning (PBL0101)

## Web-based App Development  
**Odd Semester 2025/2026**  
**Class PABW7A2-GS2526**  
Presented by **Team Tadika Mesra**

---

## Kode Tugas
**PBL0101**

---

## Nama Kelompok
**Tadika Mesra**

---

## Anggota Kelompok
| NIM | Nama |
|----|------|
| 221080200001 | Yurida Zani |
| 221080200018 | Aulia Zamaira |
| 221080200030 | Muhammad Dwiki Ramadani |
| 221080200048 | Dimas Hammam Abdillah |
| 221080200067 | Ali Sofyan |

---

## Framework & Teknologi yang Digunakan

### Frontend
- **React.js**  
- **Vite** (development server & build tool)

### Backend
- **Node.js**
- **Express.js**

### Database
- **SQLite**

Framework pilihan sesuai daftar:
- **JavaScript – React – 3**
- **JavaScript – Express – 4**

---

## Deskripsi Aplikasi
Aplikasi **Tadika Mesra** merupakan web-based application yang dikembangkan dalam rangka memenuhi tugas **Project-Based Learning (PBL0101)** pada mata kuliah **Web-based App Development**.

Aplikasi ini menggunakan:
- React.js untuk tampilan antarmuka pengguna (frontend)
- Express.js sebagai REST API (backend)
- SQLite sebagai database ringan dan mudah digunakan untuk lingkungan pembelajaran

---

## Struktur Proyek (Ringkas)

```

project-root/
│
├── client/          # Frontend (React + Vite)
│   ├── src/
│   └── package.json
│
├── server/          # Backend (Express)
│   ├── database/
│   │   └── tadika.db
│   ├── routes/
│   ├── index.js
│   └── package.json
│
└── README.md

```

---

## Akun Admin (Default)

Akun admin **sudah disiapkan secara default** untuk keperluan pengujian aplikasi.

```

Username : admin
Password : admin123

````

> ⚠️ Akun ini digunakan **hanya untuk kebutuhan tugas PBL dan demo aplikasi**, bukan untuk produksi.

---

## Mekanisme Login Admin
1. User membuka halaman login
2. Admin memasukkan **username** dan **password**
3. Data dikirim ke backend (Express)
4. Backend melakukan validasi ke database SQLite
5. Jika valid → admin diarahkan ke **dashboard admin**

---

## Cara Menjalankan Aplikasi

### 1. Menjalankan Backend
```bash
cd server
npm install
node index.js
````

Backend berjalan di:

```
http://localhost:5000
```

---

### 2. Menjalankan Frontend

```bash
cd client
npm install
npm run dev
```

Frontend berjalan di:

```
http://localhost:5173
```

---

## Catatan Tambahan

* Project ini **bukan hanya template React + Vite**
* Template bawaan Vite digunakan **sebagai dasar**, lalu dikembangkan dengan:

  * Sistem login
  * Backend Express
  * Database SQLite
* Seluruh konfigurasi disesuaikan dengan kebutuhan **PBL0101**

---

## Penutup

Proyek **Tadika Mesra** dikembangkan sebagai bentuk implementasi pembelajaran berbasis proyek untuk meningkatkan pemahaman mahasiswa dalam pengembangan aplikasi web modern menggunakan React dan Express.


