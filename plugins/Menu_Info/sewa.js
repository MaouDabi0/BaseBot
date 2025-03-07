module.exports = {
    command: ['shop', 'toko', "sewa"],
    tags: 'Info Menu',
    run: async (conn, message, { isPrefix }) => {
        try {
            const textMessage = message.message?.conversation || '';
            const prefix = isPrefix.find(p => textMessage.startsWith(p));
            if (!prefix) return;

            const args = textMessage.slice(prefix.length).trim().split(/\s+/).slice(1);
            const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
            if (!module.exports.command.includes(commandText)) return;

            if (!global.sewaList || global.sewaList.length === 0) {
                return conn.sendMessage(message.key.remoteJid, { text: "🛒 Toko sedang kosong." }, { quoted: message });
            }

            let shopList = `${head} ${Obrack} Info sewa *${botName} ${Cbrack}\n${side}\n`;
            global.sewaList.forEach((item, index) => {
                shopList += `${side} ${btn} *${index + 1}. ${item.name}*\n${side} ${btn} Rp${item.price.toLocaleString()}\n${side}\n`;
            });
            shopList += `${foot}${garis}\n`;

            shopList += `Gunakan perintah *.beli <nomor>* untuk membeli paket sewa.\n`;

            shopList += `${footer}`

            await conn.sendMessage(message.key.remoteJid, { text: shopList }, { quoted: message });
        } catch (err) {
            console.error("❌ Error di plugin sewa.js:", err);
        }
    }
};