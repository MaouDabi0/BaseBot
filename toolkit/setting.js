const fs = require('fs');
const Sys = require('./helper');

// Membaca konfigurasi dari file JSON
const setting = JSON.parse(fs.readFileSync('./toolkit/set/config.json', 'utf-8'));
const mess = JSON.parse(fs.readFileSync('./toolkit/set/message.json', 'utf-8'));

// Menetapkan nilai global untuk sistem dan konfigurasi
global.Format = Sys.Format;
global.Connect = Sys.Connect;
global.setting = setting;
global.mess = mess;

// Menetapkan nilai global dari config.json dengan nilai default
Object.assign(global, {
    garis: setting.garis || '────────────────────',
    side: setting.side || '│',
    type: setting.type || 'default',
    thumbnail: setting.thumbnail || '',
    botFullName: setting.botFullName || 'Belum Diset',
    botName: setting.botName || 'Belum Diset',
    isPrefix: ['.', ',', '#', '?', '/'],
    ownerName: setting.ownerName || 'default',
    ownerNumber: setting.ownerNumber || ['628xxxxxx'] // Default jika undefined
});

// Mengekspor semua variabel global secara otomatis
module.exports = { ...global };
