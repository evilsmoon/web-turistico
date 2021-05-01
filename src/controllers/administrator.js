const pool = require('../database');

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const fs = require('fs-extra');

module.exports = {

    getAllUsers: async (req, res) => { //Obtenemos todos los usuarios inactivos
        const persona = await pool.query('SELECT * FROM PERSONA, DIRECCION, ROL WHERE PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PERSONA.ROL_ID = ROL.ROL_ID');
        res.render('administrator/users', { persona });
    },

    getSearchUsers: async (req, res) => { //Buscar usuarios por su nombre
        const { buscar } = req.query;
        if (buscar) {
            const persona = await pool.query('SELECT * FROM PERSONA, DIRECCION, ROL WHERE PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PERSONA.ROL_ID = ROL.ROL_ID AND PERSONA_NOMBRE =  ?', [buscar]);
            res.render('administrator/users', { persona });
        } else {
            res.render('administrator/users');
        }
    },

    activeUser: async (req, res) => { //Activamos usuario por su ID
        const { id } = req.params;
        console.log('id usuario: ' + id);
        var today = new Date();
        const loginDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
        const loginHour = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
        const userLogin = loginDate + ' ' + loginHour;

        await pool.query('UPDATE PERSONA SET PERSONA_ESTADO = "Verdadero", PERSONA_LOGIN = ? WHERE PERSONA.PERSONA_ID = ?', [userLogin, id]);
        req.flash('success', 'Usuario Activado');
        res.redirect('/administrator/users');
    },

    getAllCategory: async (req, res) => { //Obtenemos todas los categorias
        const category = await pool.query('SELECT * FROM CATEGORIA WHERE CATEGORIA_ESTADO = "Verdadero"');
        res.render('administrator/category', { category });
    },

    createCategoryPost: async (req, res) => { //Agregamos nueva categoria
        const { CATEGORIA_NOMBRE, CATEGORIA_DESCRIPCION } = req.body;
        const newCategory = {
            CATEGORIA_NOMBRE,
            CATEGORIA_DESCRIPCION
        }
        await pool.query('INSERT INTO CATEGORIA set ?', [newCategory]);
        res.redirect('/administrator/category');
    },

    deleteCategory: async (req, res) => { //Eliminamos la categoria seleccionada
        const { id } = req.params;
        await pool.query('UPDATE CATEGORIA SET CATEGORIA_ESTADO = "Falso" WHERE CATEGORIA.CATEGORIA_ID = ?', [id]);
        res.redirect('/administrator/category');
    },

    getAllMeasurements: async (req, res) => { //Obtenemos todas las unidades de medida
        const measure = await pool.query('SELECT * FROM MEDIDA WHERE MEDIDA_ESTADO = "Verdadero"');
        res.render('administrator/measurements', { measure });
    },

    createMeasurementsPost: async (req, res) => { //Agregamos nueva medida
        const { MEDIDA_NOMBRE } = req.body;
        await pool.query('INSERT INTO MEDIDA (MEDIDA_ID, MEDIDA_NOMBRE) VALUES (NULL, ?)', [MEDIDA_NOMBRE]);
        res.redirect('/administrator/measurements');
    },

    deleteMeasurements: async (req, res) => { //Eliminamos la medida seleccionada
        const { id } = req.params;
        await pool.query('UPDATE MEDIDA SET MEDIDA_ESTADO = "Falso" WHERE MEDIDA.MEDIDA_ID = ?', [id]);
        res.redirect('/administrator/measurements');
    },

    getAllPresentation: async (req, res) => { //Obtenemos todas las unidades de medida
        const presentation = await pool.query('SELECT * FROM PRESENTACION WHERE PRESENTACION_ESTADO = "Verdadero"');
        res.render('administrator/presentation', { presentation });
    },

    createPresentationPost: async (req, res) => { //Agremamos nueva presentacion
        const { PRESENTACION_NOMBRE } = req.body;
        await pool.query('INSERT INTO PRESENTACION (PRESENTACION_ID, PRESENTACION_NOMBRE) VALUES (NULL, ?)', [PRESENTACION_NOMBRE]);
        res.redirect('/administrator/presentation');
    },

    deletePresentation: async (req, res) => { //Eliminamos la presentacion seleccionada
        const { id } = req.params;
        await pool.query('UPDATE PRESENTACION SET PRESENTACION_ESTADO = "Falso" WHERE PRESENTACION.PRESENTACION_ID = ?', [id]);
        res.redirect('/administrator/presentation');
    },

    getAllInformation: async (req, res) => { //Obtenemos todas las unidades de medida
        const information = await pool.query('SELECT * FROM INFORMACION WHERE INFORMACION_ESTADO = "Verdadero"');
        res.render('administrator/information', { information });
    },

    createInformationPost: async (req, res) => { //Agremamos nueva presentacion
        const { INFORMACION_DESCRIPCION, INFORMACION_IMAGEN, INFORMACION_URL, INFORMACION_ESTADO } = req.body;
        const newInfomation = {
            INFORMACION_DESCRIPCION,
            INFORMACION_IMAGEN,
            INFORMACION_URL,
            INFORMACION_ESTADO
        }
        const cloudImage = await cloudinary.uploader.upload(req.file.path); //Permite guardar las imagenes en cloudinary
        newInfomation.INFORMACION_IMAGEN = cloudImage.public_id;
        newInfomation.INFORMACION_URL = cloudImage.secure_url;
        await fs.unlink(req.file.path);

        newInfomation.INFORMACION_ESTADO = 'Verdadero';

        console.log(newInfomation);
        await pool.query('INSERT INTO INFORMACION set ?', [newInfomation]);

        res.redirect('/administrator/information');
    },

    deleteInformation: async (req, res) => { //Eliminamos la presentacion seleccionada
        const { id } = req.params;
        await pool.query('UPDATE INFORMACION SET INFORMACION_ESTADO = "Falso" WHERE INFORMACION.INFORMACION_ID = ?', [id]);
        res.redirect('/administrator/information');
    },

}