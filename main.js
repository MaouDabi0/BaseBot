/**
 * WhatsApp Bot
 * Created by Dabi
 */

require('./toolkit/system.js');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const chalk = require('chalk');
const readline = require('readline');
const config = require('./toolkit/set/config.json');
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

// ========================== //
//      UTILITY FUNCTIONS     //
// ========================== //

/**
 * Fungsi untuk meminta input dari pengguna.
 * @param {string} text - Teks pertanyaan yang ditampilkan ke pengguna.
 * @returns {Promise<string>}
 */
const question = (text) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(text, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

/**
 * Memuat semua plugin dari folder tertentu secara rekursif.
 * @param {string} directory - Direktori tempat plugin berada.
 */
const loadPlugins = (directory) => {
  if (!fs.existsSync(directory)) {
    console.log(chalk.yellow(`⚠️ Folder plugin tidak ditemukan: ${directory}`));
    return;
  }

  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadPlugins(fullPath); // Rekursi untuk folder dalam
    } else if (stat.isFile() && file.endsWith('.js')) {
      try {
        const pluginName = path.relative(pluginFolder, fullPath).replace(/\\/g, '/').replace('.js', '');
        global.plugins[pluginName] = require(fullPath);
        console.log(chalk.green(`✅ Plugin dimuat: ${pluginName}`));
      } catch (err) {
        console.log(chalk.red(`❌ Gagal memuat plugin ${file}: ${err.message}`));
      }
    }
  });
};

// ========================== //
//      PLUGIN HANDLER        //
// ========================== //

global.plugins = {};
const pluginFolder = path.join(__dirname, './plugins');
loadPlugins(pluginFolder);

// ========================== //
//     MAIN BOT FUNCTION      //
// ========================== //

/**
 * Fungsi utama untuk menjalankan bot.
 */
const startBot = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    const conn = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: pino({ level: 'silent' }),
      browser: ['Ubuntu', 'Safari', '20.0.04'],
    });

    // Jika akun belum terdaftar, minta input nomor WhatsApp untuk pairing
    if (!state.creds?.me?.id) {
      const phoneNumber = await question('Masukkan nomor bot WhatsApp Anda:\n');
      const code = await conn.requestPairingCode(phoneNumber);
      console.log('Kode Pairing:', code?.match(/.{1,4}/g)?.join('-') || code);
    }

    // ========================== //
    //   CONNECTION EVENT HANDLER //
    // ========================== //
    conn.ev.on('connection.update', ({ connection }) => {
      if (connection === 'open') {
        console.log(chalk.green.bold('✅ Bot online!'));
        conn.sendMessage('6285725892962@s.whatsapp.net', { text: 'Berhasil terhubung' });
      } else if (connection === 'connecting') {
        console.log(chalk.yellow('🔄 Menghubungkan kembali...'));
      } else if (connection === 'close') {
        console.log(chalk.red('❌ Koneksi terputus, mencoba menyambung ulang...'));
        startBot(); // Restart bot jika koneksi terputus
      }
    });

    // ========================== //
    //  MESSAGE EVENT HANDLER     //
    // ========================== //
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

        console.log(chalk.yellow.bold(`【 📩 Pesan dari 】: ${chalk.bold(sender)}`));
        console.log(chalk.green(`💬 ${textMessage}\n`));

        // Menjalankan plugin berdasarkan pesan
        for (const pluginName in global.plugins) {
          try {
            await global.plugins[pluginName].run(conn, message);
          } catch (err) {
            console.log(chalk.red(`❌ Error pada plugin ${pluginName}: ${err.message}`));
          }
        }
      } catch (error) {
        console.log(chalk.red('❌ Error dalam proses pesan masuk:'), error);
      }
    });

    // ========================== //
    //    CREDENTIAL UPDATES      //
    // ========================== //
    conn.ev.on('creds.update', saveCreds);
  } catch (error) {
    console.error(chalk.red('❌ Terjadi kesalahan saat menjalankan bot:'), error);
  }
};

// ========================== //
//      START THE BOT         //
// ========================== //
console.clear();
console.log(chalk.cyan.bold('Create By Dabi\n'));
startBot();
