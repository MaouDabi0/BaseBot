const axios = require('axios'), fs = require('fs');
const chalk = require('chalk');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { exec } = require("child_process");
const { format } = require('util');
const moment = require("moment-timezone");
const helper = async (m, {
   conn,
   store
}) => {   
   const type = Object?.keys(m?.message)[0], budy = typeof m.text == 'string' ? m.text : '', body = m.body;
   const age = m.sender.split("@")[0].substring(m.sender.split("@")[0].length - 2);
   const cmd = body?.slice(1).trim().split(/ +/).shift().toLowerCase()
   const args = body?.trim().split(/ +/).slice(1), text = args?.join(' ');
   const pushname = m.pushName || setting.botName.trim() || m.sender.split('@')[0];
   const botNumber = conn.decodeJid(conn.user.id), isMe = botNumber.split('@')[0];
   const isOwner = [...setting.ownerNumber, isMe].map(num => `${num}@s.whatsapp.net`).includes(m.sender);
   const quoted = m.quoted ? m.quoted : m
   const mime = (quoted.m || quoted).mimetype || ''
   const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat).catch(e => {}) : ''
   const groupId = m.isGroup ? groupMetadata?.id : ''
   const groupName = m.isGroup ? groupMetadata?.subject : ''
   const groupDesc = m.isGroup ? groupMetadata?.desc : ''
   const participants = m.isGroup ? groupMetadata?.participants : ''
   const groupAdmins = m.isGroup ? participants?.filter(v => v.admin !== null).map(v => v.id) : ''
   const groupOwner = m.isGroup ? groupMetadata?.owner : '';
   const isBotAdmins = m.isGroup ? groupAdmins?.includes(botNumber) : false
   const isAdmins = m.isGroup ? groupAdmins?.includes(m.sender) : false
   const mentionByTag = type == "extendedTextMessage" && m.message.extendedTextMessage.contextInfo != null ? m.message.extendedTextMessage.contextInfo.mentionedJid : []
   const mentionByReply = type == "extendedTextMessage" && m.message.extendedTextMessage.contextInfo != null ? m.message.extendedTextMessage.contextInfo.participant || "" : ""
   const mention = typeof (mentionByTag) == 'string' ? [mentionByTag] : mentionByTag; var command, prefix;   
   mention != undefined ? mention.push(mentionByReply) : []
   moment.tz.setDefault("Asia/Jakarta").locale("id");
   const jam = moment.tz('asia/jakarta').format('HH:mm:ss')
   const tanggal = moment().tz("Asia/Jakarta").format("ll")
   const suasana = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('a')
   const time = moment(new Date()).format("HH:mm");
   global.waktu = { tanggal, jam, suasana, time };
   const mentionUser = mention != undefined ? mention.filter(n => n) : []
   const isNumber = x => typeof x === 'number' && !isNaN(x);
   const users = global.db.users[m.sender] ? global.db.users[m.sender] : global.db.users[m.sender] = {}
   if (Object.keys(users).length < 1) {
      if (!('name' in users)) users.name = pushname
      if (!('registered' in users)) users.registered = false
      if (!('registeredTime' in users)) users.registeredTime = ''
      if (!('umur' in users)) users.umur = ''
      if (!('seri' in users)) users.seri = ''
      if (!('premium' in users)) users.premium = false
      if (!('premiumTime' in users)) users.premiumTime = ''
      if (!('banned' in users)) users.banned = false
      if (!('bannedReason' in users)) users.bannedReason = ''
      if (!isNumber(users.limit)) users.limit = 20
      if (!isNumber(users.kupon)) users.kupon = 5
      if (!isNumber(users.uang)) users.uang = 1000
      if (!isNumber(users.hitCmd)) users.hitCmd = 0
      if (!('notes' in users)) users.notes = ''
      if (!('lastClaim' in users)) users.lastClaim = ''
      if (!('lastHour' in users)) users.lastHour = ''
      if (!('lastUang' in users)) users.lastUang = ''
      if (!('lastKupon' in users)) users.lastKupon = ''
      if (!('lastSpin' in users)) users.lastSpin = ''
      if (!isNumber(users.spin)) users.spin = 10
      if (!('is_spin' in users)) users.is_spin = false
      if (!isNumber(users.afkTime)) users.afkTime = -1
      if (!('afkReason' in users)) users.afkReason = ''
      if (!('chat_ai' in users)) users.chat_ai = false
      if (!('event_cmd' in users)) users.event_cmd = {}
   };
   const groups = global.db.chats[groupId] ? global.db.chats[groupId] : global.db.chats[groupId] = {}   
   if (Object.keys(groups).length < 1) {
      if (!('name' in groups)) groups.name = groupName
      if (!('welcome' in groups)) groups.welcome = true
      if (!('antilink' in groups)) groups.antilink = true
      if (!('mute' in groups)) groups.mute = false
      if (!('absen' in groups)) groups.absen = false
      if (!isNumber(groups.absen_count)) groups.absen_count = 0
      if (!('absen_user' in groups)) groups.absen_user = []
      if (!('absen_text' in groups)) groups.absen_text = ''
      if (!('viewOnce' in groups)) groups.viewOnce = true
      if (!('antiToxic' in groups)) groups.antiToxic = true
      if (!('chat_ai' in groups)) groups.chat_ai = false
      if (!('description' in groups)) groups.description = groupDesc
      if (!('welcomeCaption' in groups)) groups.welcomeCaption = global.group_welcome || ''
      if (!('byeCaption' in groups)) groups.byeCaption = global.group_bye || ''
   };
   if (global.db.chats['']) delete global.db.chats['']
   const settings = global.db.settings ? global.db.settings : global.db.settings = {}   
   if (Object.keys(settings).length < 1) {
      if (!isNumber(settings.menu_type)) settings.menu_type = 2
      if (!('prefix' in settings)) settings.prefix = 'multi'
      if (!('cover' in settings)) settings.cover = setting.thumbnail
      if (!isNumber(settings.status)) settings.status = 0
      if (!('readsw' in settings)) settings.readsw = true
      if (!('autobio' in settings)) settings.autobio = true
      if (!('antispam' in settings)) settings.antispam = true
   };
   if (typeof global.db.menfess !== 'object') global.db.menfess = {}
   if (!('stores' in global.db)) global.db.stores = {}
   if (typeof global.db.stores !== 'object') global.db.stores = {}   
   if (isPrefix.find(v => body.startsWith(v))) {
      prefix = isPrefix.find(v => body.startsWith(v))
   } else if (!isPrefix.find(v => body.startsWith(v))) {
      prefix = ''
   };
   if (isPrefix.find(v => body.startsWith(v)) && db.settings.prefix === 'single') {
      command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
   } else if (db.settings.prefix === 'multi') {
      if (isPrefix.find(v => body.startsWith(v))) {
         command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
      } else if (!isPrefix.find(v => body.startsWith(v))) {
         command = body.slice(0).trim().split(/ +/).shift().toLowerCase();
      }
   };
   const isPremium = db.users[m.sender].premium || isOwner;
   const image_daftar = 'https://telegra.ph/file/ab9beaa8589f6af8887e0.jpg'
   const name_daftar = pushname || 'Setan' || `${m.sender.split("@")[0]}`;
   const text_daftar = '*Pendaftaran*'
   const button_daftar = [
      ['Daftar Otomatis', `.daftar ${name_daftar}.${age}`],
      ['Daftar Manual', '.daftar']
   ]
   global.cover = global.db.settings.cover
   global.plugins_status = (conn, jid, msg, m) => conn.adReply(jid, msg, cover, m);
   const extra = { Format, conn, prefix, command, text, mime, args, cmd, quoted, groupName, participants, groupAdmins, mentionUser, mentionByReply, budy, isAdmins, isBotAdmins, isOwner, isPremium, store };
   const register = { image_daftar, text_daftar, button_daftar };   
   Connect(m, extra, register);
   Format.Logger(m, { conn, time, chalk, pushname, groupName, body }); 
   if (budy.startsWith('>') || budy.startsWith('©')) {
      if (!isOwner || m.isBaileys) return
      try {
         m.reply(`> evaling...`)
         return await m.reply(format(await eval(`(async () => { ${budy.slice(2)} })()`)))
      } catch (e) {
         return await m.reply(format(e))
      }
   };
   if (budy.startsWith('=>') || budy.startsWith('->') || budy.startsWith('~>')) {
      if (!isOwner || m.isBaileys) return
      try {
         return await m.reply(format(await eval(`(async () => { return ${budy.slice(3)} })()`)));
      } catch (e) {
         return await m.reply(String(e));
      }
   };
   if (budy.startsWith('$') || budy.startsWith('%') || budy.startsWith('&')) {
      if (!isOwner || m.isBaileys) return      
      m.reply(`> executing...`);
      exec(budy.slice(2), async (error, stdout) => {
         if (error) await m.reply(format(error));
         if (stdout) await m.reply(format(stdout));
      });
   };
};
module.exports = helper