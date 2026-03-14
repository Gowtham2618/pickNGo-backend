const bcrypt = require('bcryptjs');

const Responses = require("../../constants/response");

const saltRounds = 10;

function hashUserPassword(password) {
    let hashedPassword = bcrypt.hashSync(password, saltRounds);
    if (!hashedPassword) {
        return Responses.error(req, res, Status.HTTP_CONFLICT, "Failed to bcrypt password !");
    }

    return hashedPassword;
}

module.exports = { hashUserPassword };