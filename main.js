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
const { Format } = require('./toolkit/helper'); // Mengimpor modul Format untuk waktu

global.plugins = {};
const pluginFolder = path.join(__dirname, './plugins');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const loadPlugins = (directory) => {
  if (!fs.existsSync(directory)) {
    console.log(chalk.yellow(`⚠️ Folder plugin tidak ditemukan: ${directory}`));
    return;
  }

  let loadedCount = 0;

  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadPlugins(fullPath);
    } else if (stat.isFile() && file.endsWith('.js')) {
      try {
        const pluginName = path.basename(fullPath, '.js');
        console.log(chalk.blue(`🔄 Memuat plugin: ${pluginName} dari ${fullPath}`));

        const plugin = require(fullPath);
        if (plugin && typeof plugin.run === 'function') {
          global.plugins[pluginName] = plugin;
          console.log(chalk.green(`✅ Plugin dimuat: ${pluginName}`));
          loadedCount++;
        } else {
          console.log(chalk.yellow(`⚠️ Plugin ${pluginName} tidak memiliki fungsi 'run'.`));
        }
      } catch (err) {
        console.log(chalk.red(`❌ Gagal memuat plugin ${file}: ${err.message}`));
      }
    }
  });

  if (loadedCount === 0) {
    console.log(chalk.red('❌ Tidak ada plugin yang berhasil dimuat.'));
  } else {
    console.log(chalk.green(`✅ Total plugin yang berhasil dimuat: ${loadedCount}`));
  }
};

const startBot = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    const conn = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: pino({ level: 'silent' }),
      browser: ['Ubuntu', 'Safari', '20.0.04'],
    });

    if (!state.creds?.me?.id) {
      const phoneNumber = await question(chalk.blue('📱 Masukkan nomor bot WhatsApp Anda:\n'));
      const code = await conn.requestPairingCode(phoneNumber);
      console.log(chalk.green('🔗 Kode Pairing:'), code?.match(/.{1,4}/g)?.join('-') || code);
    }

    conn.ev.on('connection.update', ({ connection }) => {
      if (connection === 'open') {
        console.log(chalk.green.bold('✅ Bot online!'));
        conn.sendMessage('6285725892962@s.whatsapp.net', { text: 'Berhasil terhubung' });
      } else if (connection === 'connecting') {
        console.log(chalk.yellow('🔄 Menghubungkan kembali...'));
      } else if (connection === 'close') {
        console.log(chalk.red('❌ Koneksi terputus, mencoba menyambung ulang...'));
        startBot();
      }
    });

    conn.ev.on('messages.upsert', async ({ messages }) => {
      try {
        if (!messages || messages.length === 0) return;

        const message = messages[0];
        if (!message.message) return;

        const sender = message.pushName || 'Pengguna';
        const textMessage =
          message.message.conversation ||
          message.message.extendedTextMessage?.text ||
          '[Media Terkirim]';

        const time = Format.time(); // Mengambil waktu dari modul Format

        console.log(chalk.yellow.bold(`【 Pesan dari 】: ${chalk.green.bold(sender)}`));
        console.log(chalk.cyan.bold(` [${time}]:`) + (chalk.white(` ${textMessage}`)));

        for (const pluginName in global.plugins) {
          try {
            await global.plugins[pluginName].run(conn, message);
          } catch (err) {
            console.log(chalk.red(`❌ Error pada plugin ${pluginName}: ${err.message}`));
          }
        }

        if (textMessage.startsWith(isPrefix[0])) {
          const command = textMessage.slice(isPrefix[0].length).trim();
          if (command === 'menu') {
            conn.sendMessage(message.key.remoteJid, { text: getMenu() });
          }
        }
      } catch (error) {
        console.log(chalk.red('❌ Error dalam proses pesan masuk:'), error);
      }
    });

    conn.ev.on('creds.update', saveCreds);
  } catch (error) {
    console.error(chalk.red('❌ Error saat menjalankan bot:'), error);
  }
};

console.log(chalk.cyan.bold('Create By Dabi\n'));
loadPlugins(pluginFolder);
startBot();