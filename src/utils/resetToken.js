const crypto = require("crypto");

/**
 * Generate a Secure Token (32 bytes, 256-bit)
 */
const generateResetToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = { generateResetToken, hashToken };
