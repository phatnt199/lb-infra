import CryptoJS from 'crypto-js';
import isEmpty from 'lodash/isEmpty';
import fs from 'fs';

export const hash = (text: string, options = { type: 'MD5', secret: null }): string => {
  if (!options?.type) {
    return text;
  }

  switch (options?.type) {
    case 'SHA256': {
      if (!options?.secret) {
        return text;
      }

      return CryptoJS.HmacSHA256(text, options.secret).toString(CryptoJS.enc.Hex);
    }
    case 'MD5': {
      return CryptoJS.MD5(text).toString(CryptoJS.enc.Utf8);
    }
    default: {
      return text;
    }
  }
};

export const encrypt = (message: string | number, secret: string): string => {
  return CryptoJS.AES.encrypt(message.toString(), secret).toString();
};

export const encryptFile = (absolutePath: string, secret: string): string => {
  if (!absolutePath || isEmpty(absolutePath)) {
    return '';
  }

  const buffer = fs.readFileSync(absolutePath);
  const fileContent = buffer?.toString('utf-8');
  const encrypted = encrypt(fileContent, secret);
  return encrypted;
};

export const decrypt = (message: string, secret: string): string => {
  return CryptoJS.AES.decrypt(message, secret).toString(CryptoJS.enc.Latin1);
};

export const decryptFile = (absolutePath: string, secret: string): string => {
  if (!absolutePath || isEmpty(absolutePath)) {
    return '';
  }

  const buffer = fs.readFileSync(absolutePath);
  const fileContent = buffer?.toString('utf-8');
  const decrypted = decrypt(fileContent, secret);
  return decrypted;
};
