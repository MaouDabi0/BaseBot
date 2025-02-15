/**
 * Create By Dabi
 */

const config = require('./toolkit/config.json');
const fs = require('fs');
const pino = require('pino');
const readline = require('readline');
const path = require('path');
const chalk = require('chalk');
const {
  makeInMemoryStore,
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} = require('@whiskeysockets/baileys');

// Fungsi untuk meminta input dari pengguna
const question = (text) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(text, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

// Membuat penyimpanan sementara
const store = makeInMemoryStore({
  logger: pino().child({ level: 'silent' }),
});

const start = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./session');

  const conn = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    browser: ['Ubuntu', 'Safari', '20.0.04'],
  });

  store.bind(conn.ev);

  // Jika akun belum terdaftar, minta input nomor WhatsApp untuk pairing
  if (!state.creds?.me?.id) {
    const phoneNumber = await question('Masukkan nomor bot WhatsApp Anda:\n');
    let code = await conn.requestPairingCode(phoneNumber);
    code = code?.match(/.{1,4}/g)?.join('-') || code;
    console.log('Kode Pairing:', code);
  }

  // Event listener untuk perubahan koneksi
  conn.ev.on('connection.update', (update) => {
    const { connection } = update;

    switch (connection) {
      case 'open':
        console.log('Bot online');
        conn.sendMessage('6285725892962@s.whatsapp.net', {
          text: `Berhasil terhubung`,
        });
        break;
      case 'connecting':
        console.log('Menghubungkan kembali...');
        break;
      case 'close':
        console.log('Koneksi terputus, mencoba menyambung ulang...');
        break;
    }
  });

  // Event listener untuk pesan masuk
  conn.ev.on('messages.upsert', (m) => {
    const message = m.messages[0];
    if (!message.message) return;

    const botname = config.botName; // Ambil dari config.json
    const pushname = message.pushName || 'User';
    const body =
      message.message.conversation ||
      message.message.extendedTextMessage?.text ||
      'Media message';
    const randomcolor = 'cyan'; // Bisa diubah ke warna lain

    console.log(
      chalk.white.bgCyan.bold(botname),
      chalk.keyword(randomcolor)('[ NOTIF ]'),
      chalk.keyword(randomcolor)('Dari'),
      chalk.keyword(randomcolor)(pushname),
      chalk.white(body)
    );
  });

  // Memuat plugin dari folder
  const pluginFolder = path.join(__dirname, './plugins');
  const pluginFilter = (filename) => /\.js$/.test(filename);
  global.plugins = {};

  fs.readdirSync(pluginFolder)
    .filter(pluginFilter)
    .forEach((file) => {
      const pluginPath = path.join(pluginFolder, file);
      global.plugins[file] = require(pluginPath);
    });

  // Event listener untuk pembaruan kredensial
  conn.ev.on('creds.update', saveCreds);
};

// Menjalankan fungsi utama
start();