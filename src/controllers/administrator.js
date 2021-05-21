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
        const persona = await pool.query('SELECT * FROM PERSONA, DIRECCION WHERE PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PERSONA_ESTADO = "ELIMINADO"');
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

        await pool.query('UPDATE PERSONA SET PERSONA_ESTADO = "ACTIVO", PERSONA_LOGIN = ? WHERE PERSONA.PERSONA_ID = ?', [userLogin, id]);
        req.flash('success', 'Usuario Activado');
        res.redirect('/administrator/users');
    },

    getAllCategory: async (req, res) => { //Obtenemos todas los categorias
        const category = await pool.query('SELECT * FROM CATEGORIA WHERE CATEGORIA_ESTADO = "ACTIVO"');
        res.render('administrator/category', { category });
    },

    createCategoryPost: async (req, res) => { //Agregamos nueva categoria
        const { CATEGORIA_NOMBRE, CATEGORIA_DESCRIPCION, CATEGORIA_ESTADO } = req.body;
        const newCategory = {
            CATEGORIA_NOMBRE,
            CATEGORIA_DESCRIPCION,
            CATEGORIA_ESTADO
        }
        newCategory.CATEGORIA_NOMBRE = newCategory.CATEGORIA_NOMBRE.toUpperCase();
        newCategory.CATEGORIA_DESCRIPCION = newCategory.CATEGORIA_DESCRIPCION.toUpperCase();
        newCategory.CATEGORIA_ESTADO = 'ACTIVO';
        await pool.query('INSERT INTO CATEGORIA set ?', [newCategory]);
        res.redirect('/administrator/category');
    },

    deleteCategory: async (req, res) => { //Eliminamos la categoria seleccionada
        const { id } = req.params;
        await pool.query('UPDATE CATEGORIA SET CATEGORIA_ESTADO = "ELIMINADO" WHERE CATEGORIA.CATEGORIA_ID = ?', [id]);
        res.redirect('/administrator/category');
    },

    getAllMeasurements: async (req, res) => { //Obtenemos todas las unidades de medida
        const measure = await pool.query('SELECT * FROM MEDIDA WHERE MEDIDA_ESTADO = "ACTIVO"');
        res.render('administrator/measurements', { measure });
    },

    createMeasurementsPost: async (req, res) => { //Agregamos nueva medida
        const { MEDIDA_NOMBRE, MEDIDA_ESTADO } = req.body;
        const newMeasurement = {
            MEDIDA_NOMBRE,
            MEDIDA_ESTADO,
        }
        newMeasurement.MEDIDA_NOMBRE = newMeasurement.MEDIDA_NOMBRE.toUpperCase();
        newMeasurement.MEDIDA_ESTADO = 'ACTIVO';
        await pool.query('INSERT INTO MEDIDA set ?', [newMeasurement]);
        res.redirect('/administrator/measurements');
    },

    deleteMeasurements: async (req, res) => { //Eliminamos la medida seleccionada
        const { id } = req.params;
        await pool.query('UPDATE MEDIDA SET MEDIDA_ESTADO = "ELIMINADO" WHERE MEDIDA.MEDIDA_ID = ?', [id]);
        res.redirect('/administrator/measurements');
    },

    getAllPresentation: async (req, res) => { //Obtenemos todas las unidades de medida
        const presentation = await pool.query('SELECT * FROM PRESENTACION WHERE PRESENTACION_ESTADO = "ACTIVO"');
        res.render('administrator/presentation', { presentation });
    },

    createPresentationPost: async (req, res) => { //Agremamos nueva presentacion
        const { PRESENTACION_NOMBRE, PRESENTACION_ESTADO } = req.body;
        const newPresentation = {
            PRESENTACION_NOMBRE,
            PRESENTACION_ESTADO,
        }
        newPresentation.PRESENTACION_NOMBRE = newPresentation.PRESENTACION_NOMBRE.toUpperCase();
        newPresentation.PRESENTACION_ESTADO = 'ACTIVO';
        await pool.query('INSERT INTO PRESENTACION set ?', [newPresentation]);
        res.redirect('/administrator/presentation');
    },

    deletePresentation: async (req, res) => { //Eliminamos la presentacion seleccionada
        const { id } = req.params;
        await pool.query('UPDATE PRESENTACION SET PRESENTACION_ESTADO = "ELIMINADO" WHERE PRESENTACION.PRESENTACION_ID = ?', [id]);
        res.redirect('/administrator/presentation');
    },

    getAllInformation: async (req, res) => { //Obtenemos todas las unidades de medida
        const information = await pool.query('SELECT * FROM INFORMACION WHERE INFORMACION_ESTADO = "ACTIVO"');
        res.render('administrator/information', { information });
    },

    createInformationPost: async (req, res) => { //Agremamos nueva presentacion
        const { INFORMACION_NOMBRE, INFORMACION_CARGO, INFORMACION_DESCRIPCION, INFORMACION_IMAGEN, INFORMACION_URL, INFORMACION_ESTADO } = req.body;
        const newInfomation = {
            INFORMACION_NOMBRE,
            INFORMACION_CARGO,
            INFORMACION_DESCRIPCION,
            INFORMACION_IMAGEN,
            INFORMACION_URL,
            INFORMACION_ESTADO
        }
        
        const cloudImage = await cloudinary.uploader.upload(req.file.path); //Permite guardar las imagenes en cloudinary
        newInfomation.INFORMACION_IMAGEN = cloudImage.public_id;
        newInfomation.INFORMACION_URL = cloudImage.secure_url;
        await fs.unlink(req.file.path);

        // newInfomation.INFORMACION_IMAGEN = await req.file.filename;
        // newInfomation.INFORMACION_URL = await 'http://localhost:3000/img/uploads/' + req.file.filename;

        newInfomation.INFORMACION_ESTADO = 'ACTIVO';

        console.log(newInfomation);
        await pool.query('INSERT INTO INFORMACION set ?', [newInfomation]);

        res.redirect('/administrator/information');
    },

    deleteInformation: async (req, res) => { //Eliminamos la presentacion seleccionada
        const { id } = req.params;
        await pool.query('UPDATE INFORMACION SET INFORMACION_ESTADO = "ELIMINADO" WHERE INFORMACION.INFORMACION_ID = ?', [id]);
        res.redirect('/administrator/information');
    },

}