import CryptoJS from 'crypto-js';
import dotenv from "dotenv";
dotenv.config();

const key = process.env.SECRET_KEY || "girma 234"
export const encryptAES = (data) => {
  const encry = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  return encry;
}

export const  decryptAES = (encryptedData) => {
  var bytes  = CryptoJS.AES.decrypt(encryptedData, key);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}