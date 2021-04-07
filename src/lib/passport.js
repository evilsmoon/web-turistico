const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
//Autenticacion de manera local

const pool = require('../database');//Llamamos a la base

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const fs = require('fs-extra');

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

        if (user.PERSONA_EMAIL == email && user.PERSONA_CONTRASENA == password) {
            await pool.query('UPDATE PERSONA SET PERSONA_LOGIN = ? WHERE PERSONA_EMAIL = ?', [ userLogin, email]);
            done(null, user, req.flash('success', 'Bienvenido ' + user.PERSONA_NOMBRE));
        } else {//Si la contraseña es invalida
            done(null, false, req.flash('message', 'Contraseña Incorrecta'));
        }

    } else {//Si el usuario no existe se envia un mensaje
        return done(null, false, req.flash('message', 'El usuario ' + email + ' no existe'));
    }
}));

//SINGUP
passport.use('local.signup', new LocalStrategy({
    usernameField: 'PERSONA_EMAIL',
    passwordField: 'PERSONA_CONTRASENA',
    passReqToCallback: true //Permite ingresar mas datos
}, async (req, PERSONA_EMAIL, PERSONA_CONTRASENA, done) => {
    console.log(req.body);

    var today = new Date();
    const loginDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    const loginHour = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const userLogin = loginDate + ' ' + loginHour;

    const { DIRECCION_ID, ROL_ID, PERSONA_NOMBRE, PERSONA_TELEFONO, PERSONA_ESTADO, PERSONA_LOGIN, PERSONA_IMAGEN, PERSONA_URL } = req.body;
    const rows = await pool.query('SELECT * FROM PERSONA WHERE PERSONA_EMAIL = ?', [PERSONA_EMAIL]);

    if (rows.length > 0) {
        done(null, false, req.flash('message', 'El correo ' + PERSONA_EMAIL + ' ya existe'));
    } else {
        const newUser = {
            DIRECCION_ID,
            ROL_ID,
            PERSONA_NOMBRE,
            PERSONA_TELEFONO,
            PERSONA_EMAIL,
            PERSONA_CONTRASENA,
            PERSONA_ESTADO,
            PERSONA_LOGIN,
            PERSONA_IMAGEN,
            PERSONA_URL,
        }
        newUser.ROL_ID = 2;
        newUser.PERSONA_ESTADO = 'Verdadero';
        newUser.PERSONA_LOGIN = userLogin;
        
        try {
            if (req.file.path) {
                const cloudImage = await cloudinary.uploader.upload(req.file.path); //Permite guardar las imagenes en cloudinary
                newUser.PERSONA_IMAGEN = cloudImage.public_id;
                newUser.PERSONA_URL = cloudImage.secure_url;
                await fs.unlink(req.file.path); //Elimina las imagenes, para que no guarden de manera local
            }
        } catch {
            const cloudImage = [];
            cloudImage.public_id = 'user_cd82yj.png';
            cloudImage.secure_url = 'https://res.cloudinary.com/drwpai0vu/image/upload/v1617070591/user_cd82yj.png';
            newUser.PERSONA_IMAGEN = cloudImage.public_id;
            newUser.PERSONA_URL = cloudImage.secure_url;
        }

        console.log(newUser);

        const result = await pool.query('INSERT INTO PERSONA SET ?', [newUser]);
        console.log(result);
        newUser.PERSONA_ID = result.insertId;
        return done(null, newUser);
    }

}));

passport.serializeUser((user, done) => {//Esto permite almacenar en sesion
    done(null, user.PERSONA_ID);
});

passport.deserializeUser(async (PERSONA_ID, done) => {
    const rows = await pool.query('SELECT * FROM PERSONA WHERE PERSONA_ID = ?', [PERSONA_ID]);
    done(null, rows[0]);
});