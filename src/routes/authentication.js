// const express = require('express');
// const router = express.Router();

const { Router } = require('express');
const router = Router();

const passport = require('passport');//Traemos la biblioteca de passport
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');//Lo ejecutamos en culquier ruta que queramos proteger
const { validate, createUsersValidation, loginValidation } = require('../lib/validation');

const Cart = require('../models/cart');

// SIGNUP(Crear Cuenta)
router.get('/signup', isNotLoggedIn, (req, res) => {//Renderisa el formulario
    //isNotLoggedIn no permite ver signup si ya esta logueado
    res.render('auth/signup');//Renderisamos signup
});

router.post('/signup', isNotLoggedIn, validate(createUsersValidation), passport.authenticate('local.signup', {//Recive datos del formulario   
    // successRedirect: '/profile',//Redirecciona a profile si se autentico bien
    successRedirect: '/products',
    failureRedirect: '/signup',//Redirecciona a signup si no se autentico bien
    failureFlash: true//Envia mensajes en caso de fallar
}));

// SIGNIN(Ingresar)
router.get('/signin', isNotLoggedIn, (req, res) => {//Renderisa el formulario
    res.render('auth/signin');//Renderisamos signup
});

router.post('/signin', isNotLoggedIn, validate(loginValidation), passport.authenticate('local.signin', {
    // successRedirect: '/profile',
    successRedirect: '/products',
    failureRedirect: '/signin',
    failureFlash: true
}));

router.get('/logout', isLoggedIn, (req, res) => {
    const idUser = req.user.PERSONA_ID;
    Cart.deleteCart(idUser);
    req.logOut();
    res.redirect('/')
});

module.exports = router;