const fs = require('fs');
const Sys = require('./helper');

const Setting = JSON.parse(fs.readFileSync('./toolkit/set/config.json'));
const Message = JSON.parse(fs.readFileSync('./toolkit/set/message.json'));

global.Format = Sys.Format;
global.Connect = Sys.Connect;
global.setting = Setting;
global.mess = Message;

global.garis = '────────────────────'; // Atau bisa langsung diambil dari config.json jika ada
global.side = '│';
global.type = setting.type || 'default';
global.thumbnail = setting.thumbnail || '';
global.botFullName = setting.botFullName || 'Belum Diset';
global.botName = setting.botName || 'Belum Diset';
global.isPrefix = ['.', ',', '#', '?', '/'];
global.ownerName = setting.ownerName || 'default';

module.exports = {
  isPrefix: global.isPrefix,
  botName: global.botName,
  garis: global.garis
};