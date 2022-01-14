const express = require('express');
const router = express.Router();

const pool = require('../database');

router.get('/info', async (req, res) => {
    const information = await pool.query('SELECT * FROM INFORMACION WHERE INFORMACION_ESTADO = "ACTIVO"');
    res.render('about/info', { information });
});

router.get('/us', async (req, res) => {
    const information = await pool.query('SELECT * FROM INFORMACION WHERE INFORMACION_ESTADO = "ACTIVO"');
    const numInfo = information.length;
    res.render('about/us', { information, numInfo });
});

module.exports = router;
