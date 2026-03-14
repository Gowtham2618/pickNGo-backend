const bcrypt = require('bcrypt');

const saltRounds = process.env.HASH_SALT_ROUND || 10;

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, parseInt(saltRounds));
    
    console.log('Generated Password:', password);
    console.log('Hashed Password:', hashedPassword);

    return hashedPassword;
}

module.exports = { hashPassword };
