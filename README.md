# <div align='center'>BaseBot-WhastApp</div>

<p align="center">
 <img src="https://files.catbox.moe/8hj5gf.jpg">
</p>

- - -

## Salam
   Hari yang menyenangkan teman-teman. Kali ini saya akan memberikan sebuah informasi tentang Script BaseBot ini, ini adalah sebuah Script BaseBot/Base Bot WhatsApp,  dalam rangkaian kali ini saya benar-benar berterima kasih kepada kalian yang menggunakan Script ini.

   Tentu saja Script ini bisa terhubung dengan akun/nomor WhatsApp anda, Berikut adalah beberapa spesifikasi tentang Script BaseBot ini:

- Suport Termux
- Ringan
- Type Plugins
- Menggunakan Code CJS

[![MaouDabi GitHub](https://github-readme-stats.vercel.app/api?username=maoudabi0\&show_icons=true\&theme=default#gh-light-mode-only)](https://github.com/maoudabi0/BaseBot#responsive-card-theme#gh-light-mode-only)

<br>

- - -

## Penginstalan Pada Termux

Salin atau ketik promt seperti yang ada di bawah ini di termux

 1. Update Package

   ```bash
   pkg upgrade -y && pkg update -y
   ```

 2. Install NodeJs

   ```bash
   pkg install nodejs -y
   ```

 3. Install git

   ```bash
   pkg install git -y
   ```
 
 4. Install ffmpeg

   ```bash
   pkg install ffmpeg -y
   ```
 
 5. Repo Clone

   ```bash
   git clone https://github.com/MaouDabi0/BaseBot
   ```

## Cara Memasangnya

>  [!Important] 
>  Pastikan anda membaca ini dengan baik, untuk Memasangnya ada beberapa hal yang harus anda ketahui. Jika anda belum mengetahui semua dan masih tidak faham, maka klik link yang ada di [Sini](https://whatsapp.com/channel/0029Van8WHGEAKW8OUDniG1m/906) dan pelajari baik-baik.

  Pada dasarnya, Semua Script Bot WhatsApp mendukung termux, tetapi karena keterbatasan device, akhirnya beberapa **Dev** menyarankan untuk menggunakan Penel/Server.

>  [!Tip] 
>  Gunakan Device yang **kompatibel/sesuai** dengan spesifikasi Script ini

### <div align='center'>Spesifikasi Yang Di Sarankan</div> 
  Ini adalah spesifikasi device yang saya sarankan untuk menjalankan Bot WhatsApp di Termux: 

- Ram: 3 - 12 GB
- Internal: 32 - 256 GB
- Memory: 3++
- Kec Transfer: kbps

### Tutorial

1. Change Directory

   Setelah menyalin repo dari github<br>
   `git clone https://github.com...`,<br>
   langkah selanjutnya anda perlu melakukan input promt pada termux dengan mengetik/menyalin ini
   
   ```bash
   cd BaseBot
   ```

   jika tampilan termux sudah seperti ini<br>
   `~/BaseBot $`,<br> maka langkah selanjutnya adalah

2. Node Package Meneger

   yaitu penginstalan node package, dengan cara menginput promt pada termux dengan mengetik/menyalin ini

   ```bash
   npm install
   ```
   
   tunggu hingga process selesai, jika process selesai atau berhasil maka langkah berikutnya adalah

  >  [!Tip] 
  >  Jika `npm install` tidak bisa maka gunakan

3. Yarn Package Meneger

   gunakan yarn untuk menginstall **Package** di dalam `~/node_module` pada Script Bot WhatsApp dengan cara mengetik/menyalin ini

   ```bash
   yarn install
   ```

4. Bot Running

   langkah selanjutnya adalah memasukan promt atau perintah pada termux, dengan mengetik/menyalin ini

   ```bash
   npm start
   ```

5. Connection Save

   jalankan dan masukan nomor/akun whatsapp yang akan dijadikan Bot WhatsApp, jika code pairing sudah muncul, masukan code pairing tersebut ke Perangkat tertaut.<br>
   Dan selamat Bot berhasil di jalankan. 

- - -

## Dokumentasi System Plugins

<p align="left">
Berikut adalah panduan lengkap untuk membuat plugin dengan sistem plugin saya pada bot WhatsApp yang menggunakan @whiskeysockets/baileys.
</p>

### Struktur Plugins
<p align="center">
Setiap plugin memiliki struktur dasar sebagai berikut:
</p>

```js
const fs = require('fs');
const path = require('path');
require('../../toolkit/setting');

module.exports = {
  name: 'Nama Plugin',
  command: ['command1', 'command2'],
  tags: 'Kategori Plugin',
  desc: 'Deskripsi Singkat Plugin',

  run: async (conn, message, { args, isPrefix }) => {
    try {
      const chatId = message.key.remoteJid;
      const isGroup = chatId.endsWith('@g.us');
      const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!textMessage) return;

      // Deteksi prefix yang digunakan
      const prefix = isPrefix.find(p => textMessage.startsWith(p));
      if (!prefix) return;

      // Ambil perintah setelah prefix
      const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      // Eksekusi logika plugin di sini
      await conn.sendMessage(chatId, { text: '✅ Plugin Berjalan!' }, { quoted: message });

    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Terjadi kesalahan, coba lagi nanti.' }, { quoted: message });
    }
  }
};
```

### Parameter Fungsi run
- ```conn```  -->  Objek utama dari Baileys untuk mengirim pesan.
- ```message```  -->  Data pesan yang diterima oleh bot.
- ```args```  -->  Array yang berisi argumen setelah command.
- ```isPrefix```  -->  Array yang berisi semua prefix yang didukung.

### Contoh Penggunaan
<p align="center">
Berikut adalah contoh implementasi untuk plugin menu.js yang memiliki fungsi sebagai tampilan menu:
</p>

1. Import module
```js
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const config = require('../../toolkit/set/config.json');
```
- Menggunakan @whiskeysockets/baileys untuk pengiriman pesan.
- Menggunakan config.json sebagai sumber data seperti nama bot, owner, dll.

2. Properti Plugin
```js
module.exports = {
  name: 'menu',
  command: ['menu'],
  tags: 'Info Menu',
  run: async (conn, message, { isPrefix }) => { ... }
};
```

#### Penjelasan Property Plugins
- ```name```  -->  Nama unik plugin yang digunakan untuk identifikasi.
- ```command```  -->  Array berisi daftar command yang dapat digunakan untuk memanggil plugin.
- ```tags```  -->  Kategori untuk pengelompokan plugin pada menu bot.
- ```desc``` -->  Deskripsi singkat mengenai fungsi plugin.
- ```run```  -->  Fungsi utama yang dijalankan saat plugin dipanggil.

3. Ekstraksi Data Pesan
```js
const chatId = message.key.remoteJid;
const isGroup = chatId.endsWith('@g.us');
const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
```

- ```chatId```  -->  ID chat, dapat berupa personal atau grup.
- ```isGroup```  -->  Mengecek apakah pesan berasal dari grup.
- ```senderId```  -->  ID pengirim pesan.
- ```textMessage```  -->  Teks yang dikirim oleh pengguna.

4. Validasi prefix dan command
```js
const prefix = isPrefix.find((p) => textMessage.startsWith(p));
if (!prefix) return;
```

```js
const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
if (!module.exports.command.includes(commandText)) return;

```
- ```isPrefix```  -->  Mengecek apakah pesan diawali dengan salah satu prefix yang diatur (isPrefix).
- Jika tidak ada prefix yang cocok, maka plugin tidak akan dieksekusi.

- ```commandText```  -->  Mengambil perintah setelah prefix.
- ```includes(commandText)```  -->  Mengecek apakah perintah sesuai dengan plugin.

5. Tips pengembangan
- gunakan ```conn.sendMessage``` untuk mengirim pesan.
- Gunakan ```quoted: message``` jika ingin membalas langsung ke pesan pengguna.
- Pastikan semua error ditangani dengan baik menggunakan ```try-catch```

### Cara Menambahkan Plugin Baru
1. Buat file baru di folder yang sesuai (misalnya `plugins/Menu_Info/menu.js`).
2. Pastikan struktur seperti contoh di atas.
3. Sesuaikan `name`, `command`, `tags`, dan `run`.
4. Jika ingin menambahkan fungsi tambahan, buat fungsi baru di dalam file yang sama.

- - -

## Request & Fix 
   laporkan Bug ke [sini](https://wa.me/6285725892962?text=halo+kak+aku+ingin+melaporkan+bug)

# (C)
<div align="left">
    <img src="https://img.shields.io/badge/Realese%3A-2025-0?logoSize=12&labelColor=orange&color=gray" alt="Release Badge">
    <br>
    <img src="https://img.shields.io/badge/Create%3A-Maou_Dabi-0?logoSize=12&label=Create%3A&labelColor=green&color=grey" alt="Create Badge">
</div>
