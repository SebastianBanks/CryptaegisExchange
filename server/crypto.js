var CryptoJS = require("crypto-js");

// use the users id as their seceret key, not their coinbase id the one in the database

module.exports = {
    encrypt: (message, secretKey) => {
        let encryptedData = CryptoJS.AES.encrypt(message, secretKey).toString()
        return encryptedData
    },

    decrypt: (encryptedMessage, secretKey) => {
        let bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey)
        return bytes.toString(CryptoJS.enc.Utf8)
    }
}
