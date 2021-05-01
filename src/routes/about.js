const express = require('express');
const router = express.Router();

const pool = require('../database');

router.get('/info', async (req, res) => {
    const information = await pool.query('SELECT * FROM INFORMACION WHERE INFORMACION_ESTADO = "Verdadero"');
    res.render('about/info', { information });
});

module.exports = router;
