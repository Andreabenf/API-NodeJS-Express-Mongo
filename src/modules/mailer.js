const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const { host, port, user, pass } = require("../config/mail.json");

const transport = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass },
});

transport.use('compile', hbs({
    viewEngine: {
        extName: '.html',
        partialsDir: 'mail/auth',
        layoutsDir: 'mail/auth',
       
      },
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html'
}));

module.exports = transport;
