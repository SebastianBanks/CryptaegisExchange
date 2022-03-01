import { AES, enc } from "crypto-js";

// use the users id as their seceret key, not their coinbase id the one in the database

export function encrypt(message, secretKey) {
    let encryptedData = AES.encrypt(message, secretKey).toString();
    return encryptedData;
}
export function decrypt(encryptedMessage, secretKey) {
    let bytes = AES.decrypt(encryptedMessage, secretKey);
    return bytes.toString(enc.Utf8);
}
