const authMiddleware = require('../middlewares/auth');
const express = require('express');
const router = express.Router();


router.use(authMiddleware);

router.get('/', (req, res) => {
    res.status(200).send({ ok: true });
});

module.exports = app => app.use('/projects', router);