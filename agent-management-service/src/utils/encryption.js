const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY; // Must be 32 bytes (256 bits / 8)
const IV_LENGTH = 16; // For AES, this is always 16

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) { // 64 hex characters = 32 bytes
  console.error('FATAL ERROR: API_ENCRYPTION_KEY is not defined or not a 64-character hex string (32 bytes). Please set it in the .env file.');
  // In a real app, you might throw an error or exit, depending on startup strategy
  // For this service, let's make it a critical failure.
  process.exit(1); 
}

const key = Buffer.from(ENCRYPTION_KEY, 'hex');

function encrypt(text) {
  if (text == null) { // Check for null or undefined
    return null;
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(String(text), 'utf8', 'hex'); // Ensure text is a string
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted; // Prepend IV, separated by a colon
}

function decrypt(text) {
  if (text == null) { // Check for null or undefined
    return null;
  }
  try {
    const textParts = String(text).split(':'); // Ensure text is a string
    if (textParts.length !== 2) {
      console.error("Decryption error: Invalid encrypted text format (missing IV or data).");
      return null; // Or throw an error
    }
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error.message);
    // It's crucial to handle decryption errors properly, as incorrect keys or corrupted data can cause crashes.
    // Depending on the use case, you might return null, throw a specific error, or log more details.
    return null; // Or throw new Error('Decryption failed');
  }
}

module.exports = { encrypt, decrypt };
