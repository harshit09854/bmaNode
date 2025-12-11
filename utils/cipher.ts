import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.SECRET_KEY || 'default-secret-key-32-bytes-long'; // Should be 32 bytes

// Ensure the secret key is 32 bytes
const key = crypto.createHash('sha256').update(String(SECRET_KEY)).digest('base64').substring(0, 32);

// AES Encryption function
const encryptData = (text: string): string => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

// AES Decryption function
const decryptData = (text: string): string | null => {
    try {
        const parts = text.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted data format');
        }
        const iv = Buffer.from(parts.shift() as string, 'hex');
        const encryptedText = Buffer.from(parts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        // Returning null or throwing an error can be chosen based on application needs
        return null; 
    }
};

export { encryptData, decryptData };