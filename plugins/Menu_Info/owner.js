module.exports = {
    name: 'owner',
    command: ['owner', 'contact', 'admin'],
    tags: 'Info Menu',

    run: async (conn, msg, { isPrefix }) => {
        try {
            const { remoteJid } = msg.key;
            const message = msg.message?.conversation || '';

            // Mendapatkan prefix dan command yang digunakan
            const prefix = isPrefix.find(p => message.startsWith(p));
            if (!prefix) return;

            const args = message.slice(prefix.length).trim().split(/\s+/);
            const commandText = args.shift().toLowerCase();
            if (!module.exports.command.includes(commandText)) return;

            // Mengambil data owner dari config.json
            const owner = global.ownerName
            const ownerNumber = global.contact;
            const bot = global.botName || 'Bot';

            if (!ownerNumber) {
                console.error('❌ ownerNumber tidak ditemukan. Pastikan config.json terisi dengan benar.');
                await conn.sendMessage(remoteJid, { text: 'Kontak owner tidak tersedia saat ini.' }, { quoted: msg });
                return;
            }

            const contactInfo = {
                contacts: {
                    displayName: owner,
                    contacts: [{
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${owner}\nTEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\nEND:VCARD`
                    }]
                }
            };

            await conn.sendMessage(remoteJid, contactInfo, { quoted: msg });
            await conn.sendMessage(remoteJid, { text: `Ini adalah kontak owner *${bot}*` }, { quoted: msg });

        } catch (error) {
            console.error('❌ Terjadi kesalahan di plugin owner:', error.message);
        }
    }
};
      
