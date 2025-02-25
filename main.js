/**
 * WhatsApp Bot
 * Created by Dabi
 */

require('./toolkit/setting.js');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const chalk = require('chalk');
const readline = require('readline');
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { getMenu } = require('./plugins/Main-Menu/menu');
const { Format } = require('./toolkit/helper'); 

global.plugins = {};
const pluginFolder = path.join(__dirname, './plugins');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Memuat plugin secara rekursif dari folder plugins/
const loadPlugins = (directory) => {
  if (!fs.existsSync(directory)) return console.log(chalk.yellow(`⚠️ Folder plugin tidak ditemukan: ${directory}`));

  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) return loadPlugins(fullPath);
    if (!file.endsWith('.js')) return;

    try {
      const pluginName = path.basename(fullPath, '.js');
      const plugin = require(fullPath);
      if (plugin?.run) {
        global.plugins[pluginName] = plugin;
        console.log(chalk.green(`✅ Plugin dimuat: ${pluginName}`));
      }
    } catch (err) {
      console.log(chalk.red(`❌ Gagal memuat plugin ${file}: ${err.message}`));
    }
  });
};

// Fungsi untuk memulai bot
const startBot = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const conn = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: pino({ level: 'silent' }),
      browser: ['Ubuntu', 'Safari', '20.0.04'],
    });

    // Input manual nomor WhatsApp dan kode pairing jika ID bot tidak terdeteksi
    if (!state.creds?.me?.id) {
      const phoneNumber = await question(chalk.blue('📱 Masukkan nomor bot WhatsApp Anda:\n'));
      const code = await conn.requestPairingCode(phoneNumber);
      console.log(chalk.green('🔗 Kode Pairing:'), code?.match(/.{1,4}/g)?.join('-') || code);
    }

    conn.ev.on('connection.update', ({ connection }) => {
      const statusMessage = {
        open: () => console.log(chalk.green.bold('✅ Bot online!')),
        connecting: () => console.log(chalk.yellow('🔄 Menghubungkan kembali...')),
        close: () => {
          console.log(chalk.red('❌ Koneksi terputus, mencoba menyambung ulang...'));
          startBot();
        }
      };
      statusMessage[connection]?.();
    });

    // Event untuk menangani pesan yang masuk
    conn.ev.on('messages.upsert', async ({ messages }) => {
      if (!messages?.[0]?.message) return;

      const message = messages[0];
      const sender = message.pushName || 'Pengguna';
      const time = Format.time(Math.floor(Date.now() / 1000)); 

      let displayName = sender;
      let textMessage = '';
      let mediaInfo = '';

      // Menentukan apakah pesan dari grup, status, atau chat pribadi
      if (message.key.remoteJid.endsWith('@g.us')) {
        const metadata = await conn.groupMetadata(message.key.remoteJid);
        displayName = `${metadata.subject} | ${sender}`;
      } else if (message.key.remoteJid === 'status@broadcast') {
        displayName = `${sender} | Status`;
      }

      // Mendapatkan teks pesan atau caption media
      if (message.message.conversation) {
        textMessage = message.message.conversation;
      } else if (message.message.extendedTextMessage?.text) {
        textMessage = message.message.extendedTextMessage.text;
      } else if (message.message.imageMessage?.caption) {
        textMessage = message.message.imageMessage.caption;
      } else if (message.message.videoMessage?.caption) {
        textMessage = message.message.videoMessage.caption;
      }

      // Deteksi media yang dikirim
      const mediaTypes = {
        imageMessage: '[ Gambar ]',
        videoMessage: '[ Video ]',
        audioMessage: '[ Audio ]',
        documentMessage: '[ Dokumen ]',
        stickerMessage: '[ Stiker ]',
        locationMessage: '[ Lokasi ]',
        contactMessage: '[ Kontak ]',
        pollCreationMessage: '[ Polling ]',
        liveLocationMessage: '[ Lokasi ]',
        reactionMessage: '[ Reaksi ]'
      };

      for (const [key, value] of Object.entries(mediaTypes)) {
        if (message.message[key]) mediaInfo = value;
      }

      // Menampilkan output dengan format yang diminta
      console.log(chalk.yellow.bold(`【 ${displayName} 】:`) + chalk.cyan.bold(` [ ${time} ]`));

      if (mediaInfo && textMessage) {
        console.log(chalk.white(`  ${mediaInfo} | [ ${textMessage} ]`));
      } else if (mediaInfo) {
        console.log(chalk.white(`  ${mediaInfo}`));
      } else if (textMessage) {
        console.log(chalk.white(`  [ ${textMessage} ]`));
      }

      // Menjalankan semua plugin
      for (const plugin of Object.values(global.plugins)) {
        try {
          await plugin.run(conn, message);
        } catch (err) {
          console.log(chalk.red(`❌ Error pada plugin: ${err.message}`));
        }
      }

      // Menampilkan menu dengan prefix
      if (textMessage.startsWith(isPrefix[0]) && textMessage.slice(isPrefix[0].length).trim() === 'menu') {
        conn.sendMessage(message.key.remoteJid, { text: getMenu() });
      }
    });

    conn.ev.on('creds.update', saveCreds);
  } catch (error) {
    console.error(chalk.red('❌ Error saat menjalankan bot:'), error);
  }
};

// Menjalankan bot
console.log(chalk.cyan.bold('Create By Dabi\n'));
loadPlugins(pluginFolder);
startBot();
