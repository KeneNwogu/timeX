import crypto from 'crypto'

export function simpleEncryption(message: string, secret?: string) {
    const cipher = crypto.createCipheriv('aes-256-ecb', 
    Buffer.from(secret || process.env.MESSAGE_ENCRYPTION_KEY, 'hex'), null);
    let encryptedMessage = cipher.update(message, 'utf-8', 'hex');
    encryptedMessage += cipher.final('hex');
    return encryptedMessage;
}
export function simpleDecryption(encryptedMessage: string, secret?: string) {
    const decipher = crypto.createDecipheriv('aes-256-ecb', 
    Buffer.from(secret || process.env.MESSAGE_ENCRYPTION_KEY, 'hex'), null);
    let decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf-8');
    decryptedMessage += decipher.final('utf-8');
    return decryptedMessage;
}