// const express = require('express');
// const router = express.Router();

const { Router } = require('express');
const router = Router();

const passport = require('passport');//Traemos la biblioteca de passport

const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');//Lo ejecutamos en culquier ruta que queramos proteger

const { validate, 
    createUsersValidation, 
    loginValidation,
    emailValidation,
    passwordValidation
} = require('../lib/validation');

const Cart = require('../models/cart');

const {
    createUserPage,
    createUserPost,
    confirmCountPage,
    getEmail,
    createTokenPost,
    getNewPassword,
    createPasswordPost
} = require('../controllers/authentication');

// SIGNUP(Crear Cuenta)
router.get('/signup', isNotLoggedIn, createUserPage);
router.post('/signup', isNotLoggedIn, validate(createUsersValidation), createUserPost);

// Validate Email
router.get('/confirm-email/:token', isNotLoggedIn, confirmCountPage);

// SIGNIN(Ingresar)
router.get('/signin', isNotLoggedIn, (req, res) => {//Renderisa el formulario
    res.render('auth/signin');//Renderisamos signup
});

router.post('/signin', isNotLoggedIn, validate(loginValidation), passport.authenticate('local.signin', {
    successRedirect: '/products',
    failureRedirect: '/signin',
    failureFlash: true
}));

//RECOVERY
router.get('/forgot-password', isNotLoggedIn, getEmail);
router.post('/forgot-password', isNotLoggedIn, validate(emailValidation), createTokenPost);
router.get('/reset-password/:token', isNotLoggedIn, getNewPassword);
router.post('/reset-password/:token', isNotLoggedIn, validate(passwordValidation), createPasswordPost);

// Salir de sesión
router.get('/logout', isLoggedIn, (req, res) => {
    const idUser = req.user.PERSONA_ID;
    Cart.deleteCart(idUser);
    req.logOut();
    res.redirect('/')
});

module.exports = router;