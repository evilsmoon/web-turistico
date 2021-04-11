const express = require('express');
const router = express.Router();

const pool = require('../database');

router.get('/', async (req, res) => {
    res.render('index');
});

router.get('/direction', async (req, res) => {
    const direction = await pool.query('SELECT * FROM DIRECCION');
    res.json({
        direction
    })
});

router.get('/searchname', async (req, res) => {
    const direction = await pool.query('SELECT PRODUCTO_NOMBRE FROM PRODUCTO');
    res.json({
        direction
    })
});

module.exports = router;