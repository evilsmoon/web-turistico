const express = require('express');
const router = express.Router();

const { isLoggedIn } = require('../lib/auth');

const {
    getAllBuy,
    getDetailBuy,
    getAllSell,
    getSearchSell
} = require('../controllers/detail');

router.get('/buy', isLoggedIn, getAllBuy);
router.get('/pdf/:VENTA_ID', isLoggedIn, getDetailBuy);
router.get('/sell', isLoggedIn, getAllSell);
router.get('/sell/search', isLoggedIn, getSearchSell);

module.exports = router;