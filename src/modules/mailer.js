const nodemailer = require('nodemailer');
const mailConfig = require("../config/mail.json");
const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "d6f855fc42c52f",
        pass: "1688cde15d0748"
    }
});


module.exports = transport;
