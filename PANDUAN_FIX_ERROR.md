# Panduan Installasi Lingkungan Build Android (Wajib)

Aplikasi anda gagal di-build karena komputer ini **belum memiliki Java (JDK)** dan **Android Studio**. Kedua software ini WAJIB ada untuk membuat aplikasi Android (APK).

Ikuti langkah-langkah di bawah ini satu per satu.

## Langkah 1: Install Java (JDK 17)
Kami merekomendasikan JDK 17 yang stabil untuk Android builds.
1. Buka Terminal (PowerShell) sebagai Administrator.
2. Ketik perintah berikut untuk menginstall via Winget (Windows Package Manager):
   ```powershell
   winget install -e --id EclipseAdoptium.Temurin.17.JDK
   ```
3. Setelah selesai, tutup terminal dan buka lagi, lalu cek dengan mengetik:
   ```powershell
   java -version
   ```
   Jika muncul versi java, lanjut ke langkah 2.

## Langkah 2: Install Android Studio
Android Studio berisi SDK tools yang dibutuhkan untuk memproses APK.
1. Download Android Studio di sini: https://developer.android.com/studio
2. Install seperti biasa. **PENTING**: Saat instalasi, pastikan opsi **"Android SDK"** dan **"Android Virtual Device"** dicentang.
3. Setelah install selesai, Buka "Android Studio".
4. Ikuti "Setup Wizard" sampai selesai (ini akan mendownload komponen SDK tambahan).

## Langkah 3: Setting Environment Variable (Otomatisasi Capacitor)
Agar perintah `npx cap open android` bekerja, anda perlu menambahkan path Android Studio.
1. Cari folder instalasi Android Studio (biasanya di `C:\Program Files\Android\Android Studio`).
2. Masukkan path tersebut ke System Environment Variables dengan nama `CAPACITOR_ANDROID_STUDIO_PATH` (Opsional, tapi membantu).

## Langkah 4: Build Ulang
Setelah semua terinstall:
1. Buka terminal di folder project ini (`c:\remove`).
2. Jalankan:
   ```powershell
   npx cap open android
   ```
   Android Studio akan terbuka dengan project anda.
3. Di dalam Android Studio, tunggu loading (Gradle Sync) selesai.
4. Klik menu **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

## Solusi Cepat (Tanpa Android Studio GUI)
Jika anda hanya ingin build lewat terminal (setelah install Java & SDK):
1. Pastikan file `local.properties` ada di dalam folder `android/` dan berisi path ke sdk anda. Contoh isi file `android/local.properties`:
   ```
   sdk.dir=C:\\Users\\(NamaUser)\\AppData\\Local\\Android\\Sdk
   ```
2. Jalankan:
   ```powershell
   cd android
   ./gradlew assembleDebug
   ```
