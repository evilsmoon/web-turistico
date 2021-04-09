// const express = require('express');
// const router = express.Router();

const { Router } = require('express');
const router = Router();

const { isLoggedIn } = require('../lib/auth');

const {
    validate,
    createProductsValidation,
    editProductsValidation,
    editUsersValidation
} = require('../lib/validation');

const {
    getAllProducts,
    createProductPage,
    createProductPost,
    deleteProduct,
    deleteOffert,
    editProductPage,
    editProductPost,
    editPeoplePage,
    editPeoplePost,
} = require('../controllers/products');

router.get('/', isLoggedIn, getAllProducts);
router.get('/add', isLoggedIn, createProductPage);
router.post('/add', isLoggedIn, validate(createProductsValidation), createProductPost);
router.get('/delete/:producto_id', isLoggedIn, deleteProduct);
router.get('/deleteoffer/:producto_id', isLoggedIn, deleteOffert);
router.get('/edit/:producto_id', isLoggedIn, editProductPage);
router.post('/edit/:producto_id', isLoggedIn, validate(editProductsValidation), editProductPost);

// Editar Persona
router.get('/user', isLoggedIn, editPeoplePage);
router.post('/user', isLoggedIn, validate(editUsersValidation), editPeoplePost);

module.exports = router;