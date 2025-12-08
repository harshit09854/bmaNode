import bcrypt from 'bcryptjs';

const saltRounds = 10;

/**
 * Encrypts a raw password using bcrypt.
 * @param {string} rawPassword - The plain text password.
 * @returns {Promise<string>} The hashed password.
 */
export const encryptPassword = async (rawPassword) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashed = await bcrypt.hash(rawPassword, salt);
    return hashed;
};

/**
 * Compares a plain text password with a hashed password.
 * @param {string} passwordText - The plain text password to compare.
 * @param {string} encryptedPassword - The hashed password from the database.
 * @returns {Promise<boolean>} True if the passwords match, false otherwise.
 */
export const comparePassword = async (passwordText, encryptedPassword) => {
    console.log("Compared passwords:", passwordText, encryptedPassword);
    return await bcrypt.compare(passwordText, encryptedPassword);
};
