const fsExtra = require('fs-extra');
var fs = require('fs');

const pool = require('../database');

module.exports = {

    activeUserGet: async (req, res) => { //Obtenemos todos los usuarios inactivos
        var noUser = false;
        res.render('administrator/users', { noUser });
    },

    activeUserSearch: async (req, res) => { //Buscar usuarios por su nombre
        const { buscar } = req.query;
        var noUser = false;

        if (buscar) {
            const persona = await pool.query('SELECT * FROM PERSONA, DIRECCION WHERE PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PERSONA_ESTADO = "ELIMINADO" AND PERSONA_NOMBRE =  ?', [buscar]);

            if (persona.length == 0) {
                noUser = true;
            }

            res.render('administrator/users', { persona, noUser });
        } else {
            noUser = true;
            res.render('administrator/users', { noUser });
        }
    },

    activeUserPost: async (req, res) => { //Activamos usuario por su ID
        const { id } = req.params;
        console.log('id usuario: ' + id);
        var today = new Date();
        const loginDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
        const loginHour = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
        const userLogin = loginDate + ' ' + loginHour;

        await pool.query('UPDATE PERSONA SET PERSONA_ESTADO = "ACTIVO", PERSONA_LOGIN = ? WHERE PERSONA.PERSONA_ID = ?', [userLogin, id]);

        const rows = await pool.query('SELECT * FROM PERSONA WHERE PERSONA_ID = ?', [id]);
        const user = rows[0];

        req.flash('success', 'La cuenta del usuario ' + user.PERSONA_NOMBRE + ' está activado');
        res.redirect('/administrator/users');
    },

    // ------------------------------------------------------------------------------------------------------
    // DAR PERMISOS DE ADMINISTRADOR
    // ------------------------------------------------------------------------------------------------------
    activeAdminGet: async (req, res) => { //Obtenemos pagina de admin
        var noUser = false;
        res.render('administrator/addAdmin', { noUser });
    },

    activeAdminSearch: async (req, res) => { //Buscar usuarios por su nombre
        const { buscar } = req.query;
        var noUser = false;

        if (buscar) {
            const persona = await pool.query('SELECT * FROM PERSONA, DIRECCION WHERE PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PERSONA.ROL_ID = 2 AND PERSONA_ESTADO = "ACTIVO" AND PERSONA_NOMBRE =  ?', [buscar]);

            if (persona.length == 0) {
                noUser = true;
            }

            res.render('administrator/addAdmin', { persona, noUser });
        } else {
            noUser = true;
            res.render('administrator/addAdmin', { persona, noUser });
        }
    },

    activeAdminPost: async (req, res) => { //Activamos usuario por su ID
        const { id } = req.params;
        await pool.query('UPDATE PERSONA SET ROL_ID = 1 WHERE PERSONA.PERSONA_ID = ?', [id]);
        const rows = await pool.query('SELECT PERSONA_NOMBRE FROM PERSONA WHERE PERSONA_ID = ?', [id]);
        const persona = rows[0].PERSONA_NOMBRE;
        req.flash('success', 'El usuario ' + persona + ' ahora posee permisos de administrador');
        res.redirect('/administrator/addAdmin');
    },
    // ------------------------------------------------------------------------------------------------------
    // ELIMINAR USUARIO
    // ------------------------------------------------------------------------------------------------------
    deleteUserGet: async (req, res) => { //Obtenemos pagina de admin
        var noUser = false;
        res.render('administrator/deleteUser', { noUser });
    },

    deleteUserSearch: async (req, res) => { //Buscar usuarios por su nombre
        const { buscar } = req.query;
        var noUser = false;

        if (buscar) {
            const persona = await pool.query('SELECT * FROM PERSONA, DIRECCION WHERE PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PERSONA_ESTADO = "ACTIVO" AND PERSONA_NOMBRE =  ?', [buscar]);

            if (persona.length == 0) {
                noUser = true;
            }

            res.render('administrator/deleteUser', { persona, noUser });
        } else {
            noUser = true;
            res.render('administrator/deleteUser', { persona, noUser });
        }
    },

    deleteUserPost: async (req, res) => { //Activamos usuario por su ID
        const { id } = req.params;
        console.log(id);
        await pool.query('UPDATE PERSONA SET PERSONA_ESTADO = "ELIMINADO" WHERE PERSONA.PERSONA_ID = ?', [id]);
        await pool.query('UPDATE PRODUCTO SET PRODUCTO_ESTADO = "ELIMINADO" WHERE PRODUCTO.PERSONA_ID = ?', [id]);
        // UPDATE `producto` SET `PRODUCTO_ESTADO` = 'ELIMINADO' WHERE `producto`.`PRODUCTO_ID` = 2;
        const rows = await pool.query('SELECT PERSONA_NOMBRE FROM PERSONA WHERE PERSONA_ID = ?', [id]);
        const persona = rows[0].PERSONA_NOMBRE;
        req.flash('success', 'El usuario ' + persona + ' ahora se encuntra eliminado');
        res.redirect('/administrator/addUser');
    },
    // ------------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------------

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
        try {
            await pool.query('INSERT INTO CATEGORIA set ?', [newCategory]);
        } catch (error) {
            return cb(new Error('Error al agregar una nueva categoria'));
        }
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
        try {
            await pool.query('INSERT INTO MEDIDA set ?', [newMeasurement]);
        } catch (error) {
            return cb(new Error('Error al agregar una nueva medida'));
        }
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
        try {
            await pool.query('INSERT INTO PRESENTACION set ?', [newPresentation]);
        } catch (error) {
            return cb(new Error('Error al agregar una nueva presentación'));
        }
        res.redirect('/administrator/presentation');
    },

    deletePresentation: async (req, res) => { //Eliminamos la presentacion seleccionada
        const { id } = req.params;
        await pool.query('UPDATE PRESENTACION SET PRESENTACION_ESTADO = "ELIMINADO" WHERE PRESENTACION.PRESENTACION_ID = ?', [id]);
        res.redirect('/administrator/presentation');
    },

    getAllInformation: async (req, res) => { //Obtenemos toda la información relacionada a los colaboradores
        const information = await pool.query('SELECT * FROM INFORMACION WHERE INFORMACION_ESTADO = "ACTIVO"');
        res.render('administrator/information', { information });
    },

    createInformationPost: async (req, res, cb) => { //Agremamos nueva presentacion
        const { INFORMACION_NOMBRE, INFORMACION_CARGO, INFORMACION_DESCRIPCION, INFORMACION_IMAGEN, INFORMACION_ESTADO } = req.body;
        const newInfomation = {
            INFORMACION_NOMBRE,
            INFORMACION_CARGO,
            INFORMACION_DESCRIPCION,
            INFORMACION_IMAGEN,
            INFORMACION_ESTADO
        }

        console.log(newInfomation);

        try {
            if (req.file.path) {
                let buff = fs.readFileSync(req.file.path);
                let base64data = buff.toString('base64');
                newInfomation.INFORMACION_IMAGEN = base64data;
                await fsExtra.unlink(req.file.path); //Elimina las imagenes, para que no guarden de manera local
            }
        } catch (error) {
            return cb(new Error('Agregue una imagen'));
        }

        newInfomation.INFORMACION_ESTADO = 'ACTIVO';

        // console.log(newInfomation);
        try {
            await pool.query('INSERT INTO INFORMACION set ?', [newInfomation]);
        } catch (error) {
            return cb(new Error('Error al crear nuevo colaborador'));
        }

        req.flash('success', 'Información agregada con exito');
        res.redirect('/administrator/information');
    },

    deleteInformation: async (req, res) => { //Eliminamos la presentacion seleccionada
        const { id } = req.params;
        await pool.query('UPDATE INFORMACION SET INFORMACION_ESTADO = "ELIMINADO" WHERE INFORMACION.INFORMACION_ID = ?', [id]);
        res.redirect('/administrator/information');
    },

}