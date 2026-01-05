# Cara Build APK Tanpa Install Android Studio (Via GitHub)

Karena anda tidak ingin menginstall Android Studio di komputer ini, solusi terbaik adalah menggunakan **GitHub Actions**. Cloud server GitHub yang akan membuatkan APK untuk anda.

### Langkah-langkah:

1. **Buat Repository Baru di GitHub**:
   - Buka [GitHub.com](https://github.com/new).
   - Buat repository baru (Public/Private bebas).
   - Jangan centang "Add README" (biarkan kosong).

2. **Upload Kode ke GitHub**:
   Jalankan perintah ini di terminal (ganti URL dengan repository anda):
   ```bash
   git add .
   git commit -m "Siap build APK"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPO.git
   git push -u origin main
   ```

3. **Download APK**:
   - Setelah push, buka halaman repository anda di GitHub.
   - Klik tab **Actions** di bagian atas.
   - Anda akan melihat proses "Build Android APK" sedang berjalan (warna kuning/hijau).
   - Tunggu sampai hijau (selesai).
   - Klik judul workflow tersebut, lalu scroll ke bawah ke bagian **Artifacts**.
   - Klik `app-debug.apk` untuk mendownload hasilnya!

Ini adalah cara paling bersih tanpa mengotori komputer anda dengan file instalasi yang besar.
