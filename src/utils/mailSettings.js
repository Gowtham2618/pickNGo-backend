const nodemailer = require('nodemailer');

const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gowthamsankar1026@gmail.com',
        pass: 'udoe zpqx ijwf yfum',
    },
});

module.exports = { mailTransporter };