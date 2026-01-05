# Majelis Sholawat Ar-Rahmah App

Aplikasi ini telah dikonversi menjadi proyek Native Hybrid menggunakan **Capacitor**.
Proyek ini siap untuk di-build menjadi file APK Android.

## Cara Build APK (Android)

1. **Pastikan Requirements Terinstall**:
   - Node.js (Sudah ada)
   - Android Studio (Wajib untuk build APK native)

2. **Inisialisasi Android Platform**:
   Jika folder `android` belum ada, jalankan perintah ini di terminal:
   ```bash
   npx cap add android
   ```

3. **Build Aplikasi Web ke Native**:
   Setiap kali anda mengubah kode HTML/CSS/JS di folder `www`, jalankan:
   ```bash
   npx cap sync
   ```

4. **Buat APK**:
   Cara paling mudah adalah membuka proyek di Android Studio:
   ```bash
   npx cap open android
   ```
   - Tunggu Android Studio terbuka dan loading (Gradle Sync).
   - Klik menu **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - Setelah selesai, notifikasi akan muncul ("APK(s) generated successfully"). Klik **locate** untuk melihat file `.apk`.

   **Alternatif (Tanpa membuka Android Studio - Membutuhkan SDK di Terminal):**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   File APK akan berada di: `android/app/build/outputs/apk/debug/app-debug.apk`

## Struktur File
- `www/`: Folder kode sumber utama (HTML, CSS, JS).
- `capacitor.config.json`: Konfigurasi ID aplikasi dan nama.
- `package.json`: Daftar dependencies.
