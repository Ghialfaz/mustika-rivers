# 🚀 Panduan Menjalankan Project Flood IoT

Sistem monitoring sungai secara real-time dengan analisis cerdas untuk mendeteksi dan memahami potensi banjir.

## 📦 Prasyarat

* **Node.js** (disarankan versi LTS)
* **npm** (biasanya sudah termasuk dengan Node.js)
* **VS Code**
* **MySQL / MariaDB**
* **phpMyAdmin** (opsional, atau tool database lain sesuai preferensi)

---

## ▶️ Langkah Menjalankan Project

### 1️⃣ Install Dependency Backend

1. Buka **VS Code**
2. Klik menu **File → Open Folder**
3. Pilih folder **backend** yang ada di dalam project
4. Buka **Terminal VS Code**
5. Jalankan perintah berikut:

```bash
npm install
```

6. Pastikan folder `node_modules` berhasil dibuat

---

### 2️⃣ Install Dependency Frontend (Flood IoT)

1. Buka folder **flood_iot** di VS Code
2. Buka terminal
3. Jalankan perintah berikut:

```bash
npm install
```

4. Pastikan kembali folder `node_modules` muncul

---

### 3️⃣ Menjalankan Server & Tailwind CSS

Masih berada di folder **flood_iot**, lakukan langkah berikut:

#### 🔹 Buka 2 Terminal di VS Code

(Jika hanya ada satu terminal, klik **New Terminal**)

---

#### Terminal 1 – Menjalankan Server AI

```bash
cd backend
node index.js
```

Pastikan server AI berhasil berjalan tanpa error.

---

#### Terminal 2 – Menjalankan Tailwind CSS

```bash
npx tailwindcss -i ./src/css/input.css -o ./public/css/output.css --watch
```

Tailwind CSS akan berjalan dalam mode **watch** dan otomatis meng-compile CSS.

---

#### ✅ Final Step

Jika semua sudah berjalan dengan baik:

* Tutup terminal dengan **Ctrl + J**
* Project berhasil dijalankan 🎉

---

### 4️⃣ Import Database

1. Buka **phpMyAdmin** (atau database tool pilihan Anda)
2. Buat database baru (jika belum ada)
3. Import file `.sql` yang berada di folder:

```text
database/
```

4. Sesuaikan konfigurasi database (host, user, password, db name)

---

## 📝 Catatan Tambahan

* Website ini harus terhubung langsung dengan komponen IoT agar dapat berfungsi sepenuhnya
* Pastikan port backend tidak bentrok dengan aplikasi lain
* Jika terjadi error `timeout` atau koneksi AI lambat, cek konfigurasi server dan environment
* Gunakan Node.js versi yang konsisten untuk menghindari dependency conflict

---

✨ **Project siap digunakan!**