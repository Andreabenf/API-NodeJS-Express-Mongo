const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authconfig = require('../../config/auth');
const mailer = require('../../modules/mailer');

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, authconfig.secret, {
        expiresIn: 85404,
    });
}




router.post('/register', async (req, res) => {
    const { email } = req.body;
    try {
        if (await User.findOne({ email })) {
            return res.status(400).send({ error: "Usuario ja existe,man" })
        }
        const user = await User.create(req.body);

        user.password = undefined;
        return res.send({
            user,
            token: generateToken({ id: user.id }),
        });
    }
    catch (err) {
        return res.status(400).send(req.body);
    }
});

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(400).send({ error: 'User não encontrado' });
    }

    if (!await bcrypt.compare(password, user.password)) {
        return res.status(400).send({ error: 'Invalida essa senha ai' });
    }
    user.password = undefined;



    res.send({
        user,
        token: generateToken({ id: user.id }),
    });
});

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({email});

        if(!user){
            res.status(400).send({error : "Usuario não encontrado"});
        }
        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours()+1);

        await User.findByIdAndUpdate(user.id,{
            '$set': {
                passwordResetToken: token,
                passwordResetTokenExpires: now,
            }
        });

        mailer.sendMail({
            to: email,
            from: "andrezingameplay@gmail.com",
            template: "auth/forgot_password",
            context : {token},
        }, (err)=>{
            if(err){
                return res.status(400).send({error: "Não consegui mandar email de recuperar senha"})
            }
            return res.send();
        })

    } catch (err) { 
        res.status(400).send({error: "Erro no Esqueci minha senha"});

    }


})

module.exports = app => app.use('/auth', router);