const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function uploadToCatbox(filePath) {
  try {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("userhash", ""); // Opsional
    form.append("fileToUpload", fs.createReadStream(filePath));

    const response = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 30000, // Timeout 30 detik
    });

    if (response.data.startsWith("https://")) {
      return response.data; // URL hasil unggahan
    } else {
      throw new Error(`Gagal mengunggah ke Catbox: ${response.data}`);
    }
  } catch (error) {
    throw new Error(`Error saat mengunggah ke Catbox: ${error.message}`);
  }
}

module.exports = { uploadToCatbox };