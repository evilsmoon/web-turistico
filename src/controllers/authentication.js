const fs = require('fs-extra');
var md5 = require('md5');

const pool = require('../database');

const { getToken, getTokenData } = require('../lib/jwt.config');
const { getTemplate, sendEmail } = require('../lib/mail');

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = {

    createUserPage: async (req, res) => { 
        res.render('auth/signup');
    },

    createUserPost: async (req, res, cb) => { // Creamos nuevo usuario
        console.log(req.body);

        var today = new Date();
        const loginDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
        const loginHour = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
        const userLogin = loginDate + ' ' + loginHour;

        const { DIRECCION_ID, ROL_ID, PERSONA_NOMBRE, PERSONA_TELEFONO, PERSONA_EMAIL, PERSONA_CONTRASENA, PERSONA_ESTADO, PERSONA_LOGIN, PERSONA_IMAGEN, PERSONA_URL } = req.body;
        const rows = await pool.query('SELECT * FROM PERSONA WHERE PERSONA_EMAIL = ?', [PERSONA_EMAIL]);

        if (rows.length > 0) {
            return cb(new Error('El correo ' + PERSONA_EMAIL + ' ya existe'));
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
            newUser.PERSONA_NOMBRE = newUser.PERSONA_NOMBRE.toUpperCase();
            newUser.PERSONA_CONTRASENA = md5(PERSONA_CONTRASENA);
            newUser.PERSONA_ESTADO = 'POR_APROBAR';
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
            await pool.query('INSERT INTO PERSONA SET ?', [newUser]);

            // Validar usuario por correo
            // Generar token
            const token = getToken({ PERSONA_EMAIL, PERSONA_CONTRASENA });

            // Obtener un template para el correo
            const link = `http://localhost:3000/confirm-email/${token}`;
            const template = getTemplate(PERSONA_NOMBRE, link);

            // Enviar el email
            await sendEmail(PERSONA_EMAIL, 'Validación de cuenta', template);

            req.flash('success', 'Cuenta creada con exito, por favor revise su correo');
            res.redirect('/signin');
        }
    },

    confirmCountPage: async (req, res, cb) => { // Obtenemos el token para validar la cuenta
        try {

            // Obtener el token
            const { token } = req.params;

            // Verificar la data
            const data = await getTokenData(token);

            if (data === null) {
                return cb(new Error('Error al obtener data'));
            }

            console.log(data);

            const { PERSONA_EMAIL, PERSONA_CONTRASENA } = data.data;

            // Verificar existencia del usuario
            const rows = await pool.query('SELECT * FROM PERSONA WHERE PERSONA_EMAIL = ?', [PERSONA_EMAIL]);

            if (rows.length > 0) {
                const user = rows[0];

                console.log('PERSONA_CONTRASENA: ' + PERSONA_CONTRASENA);
                console.log('user.PERSONA_CONTRASENA: ' + user.PERSONA_CONTRASENA);
                const passMd5 = md5(PERSONA_CONTRASENA);

                if (passMd5 == user.PERSONA_CONTRASENA) {
                    await pool.query('UPDATE PERSONA SET PERSONA_ESTADO = "ACTIVO" WHERE PERSONA_ID = ?', [user.PERSONA_ID]);
                    req.flash('success', 'Cuenta confirmada correctamente');
                    res.redirect('/signin');
                } else {
                    req.flash('success', 'Error al confirmar usuario');
                    res.redirect('/signin');
                }
            }

        } catch (error) {
            return cb(new Error('Error al confirmar usuario'));
        }
    },

    getEmail: async (req, res) => {
        res.render('auth/forgot-password');
    },

    createTokenPost: async (req, res) => { // Creamos un token para enviar usurio solicitante
        console.log(req.body);
        const { email } = req.body;

        const rows = await pool.query('SELECT * FROM PERSONA WHERE PERSONA_EMAIL = ?', [email]);

        // Make sure user exist in database
        if (rows.length > 0) {
            const user = rows[0];
            const id = user.PERSONA_ID;
            const email = user.PERSONA_EMAIL;
            const password = user.PERSONA_CONTRASENA;

            // Generar token
            const token = getToken({ id, email, password });

            const link = `http://localhost:3000/reset-password/${token}`;
            // const link = `https://compraventa-cotopaxi.herokuapp.com/${user.PERSONA_ID}/${token}`;
            // console.log(link);

            // Obtener un template para el correo
            const template = getTemplate(user.PERSONA_NOMBRE, link);

            // Enviar el email
            await sendEmail(user.PERSONA_EMAIL, 'Recuperacion de contraseña', template);

            req.flash('success', 'Revise por favor su correo');
            res.redirect('/signin');

        } else {//Si el usuario no existe se envia un mensaje
            req.flash('message', 'El usuario ' + email + ' no existe');
            res.redirect('/forgot-password');
        }

    },

    getNewPassword: async (req, res, cb) => { // Obtenemos el token que se envio a la pagina web
        try {
            // Obtener el token
            const { token } = req.params;

            // Verificar la data
            const data = await getTokenData(token);

            if (data === null) {
                return cb(new Error('Error al obtener data'));
            }

            console.log(data);

            const { id } = data.data;

            // Verificar existencia del usuario
            const rows = await pool.query('SELECT * FROM PERSONA WHERE PERSONA_ID = ?', [id]);

            if (rows.length > 0) {
                res.render('auth/reset-password');
            } else {
                req.flash('success', 'Error de token de usuario');
                res.redirect('/signin');
            }

        } catch (error) {
            return cb(new Error('Error al confirmar token'));
        }
    },

    createPasswordPost: async (req, res, cb) => { // Creamos la nueva contraseña
        try {
            // Obtener el token
            const { token } = req.params;

            // Obtener las contraseñas
            const { password1, password2 } = req.body;

            // Verificar la data
            const data = await getTokenData(token);

            if (data === null) {
                return cb(new Error('Error al obtener data'));
            }

            console.log(data);

            const { id } = data.data;

            // Verificar existencia del usuario
            const rows = await pool.query('SELECT * FROM PERSONA WHERE PERSONA_ID = ?', [id]);
            const passMd5 = md5(password1);

            if (rows.length > 0) {
                await pool.query('UPDATE PERSONA SET PERSONA_CONTRASENA = ? WHERE PERSONA.PERSONA_ID = ?', [passMd5, id]);
                req.flash('success', 'La contraña fue cambiada con exito');
                res.redirect('/signin');

            } else {
                req.flash('success', 'Error de token de usuario');
                res.redirect('/signin');
            }

        } catch (error) {
            return cb(new Error('Error al confirmar token'));
        }
    }

}