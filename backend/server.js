const express = require('express');
const cors = require('cors');
const path = require('path'); 
require('dotenv').config();

// Impor 'http' bawaan Node dan 'Server' dari socket.io
const http = require('http');
const { Server } = require("socket.io");

// Impor Rute
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();

// Buat server HTTP dari aplikasi Express Anda
const httpServer = http.createServer(app);

// Inisialisasi Socket.io di atas server HTTP
// --- PERUBAHAN DI SINI: Izinkan semua origin ('*') untuk ngrok ---
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Mengizinkan koneksi dari URL ngrok
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Seorang user terkoneksi via WebSocket');
  socket.on('disconnect', () => {
    console.log(' disconnected.');
  });
});

const PORT = process.env.PORT || 4000;

// --- Middleware ---

// --- PERUBAHAN DI SINI: Izinkan CORS untuk semua rute API ---
app.use(cors()); 

app.use(express.json());

// Buat middleware untuk "menyuntikkan" 'io' ke setiap request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- Rute Prioritas (API & Aset Statis) ---
// Rute-rute ini HARUS didefinisikan SEBELUM 'catch-all'

// 1. Sajikan gambar upload dari /public/uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 2. Rute API Anda
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);      

// --- PENAMBAHAN BARU (SAJIKAN FRONTEND) ---
// Tentukan path ke folder build frontend
const frontendDistPath = path.join(__dirname, '../frontend/dist');

// 3. Sajikan file statis (CSS, JS, gambar) dari build React
app.use(express.static(frontendDistPath));

// 4. Fallback "Catch-All" (PENTING UNTUK REACT ROUTER)
// Ini akan menangkap rute non-API (spt /dashboard, /profile)
// dan mengirimkan file index.html React.
app.use((req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});
// -------------------------------------------

// --- Jalankan Server ---
// Gunakan httpServer.listen, BUKAN app.listen
httpServer.listen(PORT, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${PORT}`);
});