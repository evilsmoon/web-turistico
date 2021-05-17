const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var md5 = require('md5');
//Autenticacion de manera local

const pool = require('../database');//Llamamos a la base

// //SINGIN
passport.use('local.signin', new LocalStrategy({//Esto es para el login
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {

    var today = new Date();
    const loginDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    const loginHour = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const userLogin = loginDate + ' ' + loginHour;

    const rows = await pool.query('SELECT * FROM PERSONA WHERE PERSONA_EMAIL = ?', [email]);

    if (rows.length > 0) {//Si el usuario existe, valido su contraseña
        const user = rows[0];
        const passMd5 = md5(password);

        if (user.PERSONA_ESTADO == 'PASIVO' || user.PERSONA_ESTADO == 'POR_APROBAR') {
            return done(null, false, req.flash('message', 'Su cuenta está desactivada'));
        }

        if (user.PERSONA_EMAIL == email && user.PERSONA_CONTRASENA == passMd5) {
            await pool.query('UPDATE PERSONA SET PERSONA_LOGIN = ? WHERE PERSONA_EMAIL = ?', [userLogin, email]);
            done(null, user, req.flash('success', 'Bienvenido ' + user.PERSONA_NOMBRE));
        } else {//Si la contraseña es invalida
            done(null, false, req.flash('message', 'Contraseña Incorrecta'));
        }

    } else {//Si el usuario no existe se envia un mensaje
        return done(null, false, req.flash('message', 'El usuario ' + email + ' no existe'));
    }
}));

passport.serializeUser((user, done) => {//Esto permite almacenar en sesion
    done(null, user.PERSONA_ID);
});

passport.deserializeUser(async (PERSONA_ID, done) => {
    const rows = await pool.query('SELECT * FROM PERSONA WHERE PERSONA_ID = ?', [PERSONA_ID]);
    done(null, rows[0]);
});