const pool = require('../database');

module.exports = {

    getAllUsers: async (req, res) => { //Obtenemos todos los usuarios inactivos
        const persona = await pool.query('SELECT * FROM PERSONA, DIRECCION WHERE PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID');
        res.render('administrator/users', { persona });
    },   

    getSearchUsers: async (req, res) => { //Buscar usuarios por su nombre
        const { buscar } = req.query;
        if (buscar) {
            const persona = await pool.query('SELECT * FROM PERSONA, DIRECCION WHERE PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PERSONA_NOMBRE =  ?', [buscar]);
            res.render('administrator/users', { persona });
        } else {
            res.render('administrator/users');
        }
    },

    editUserPost: async (req, res) => { // Obtener datos de la pagina modificacion de usuario
        const { PERSONA_ID, PERSONA_ESTADO } = req.body;        
        console.log('PERSONA_ID: ' + PERSONA_ID);
        console.log('PERSONA_ESTADO: ' + PERSONA_ESTADO);
        await pool.query('UPDATE PERSONA SET PERSONA_ESTADO = ? WHERE PERSONA_ID = ?', [PERSONA_ESTADO, PERSONA_ID]);
        res.redirect('/administrator/users');
    },

    deleteUsers: async (req, res) => { //Eliminamos usuarios por su ID
        const { id } = req.params;
        console.log('id usuario: ' + id);
        // await pool.query('DELETE FROM persona WHERE PERSONA_ID = ?', [id]);
        // res.redirect('/administrator/users');
    },

    getAllCategory: async (req, res) => { //Obtenemos todas los categorias
        const category = await pool.query('SELECT * FROM CATEGORIA');
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

    editCategoryPost: async (req, res) => { //Editamos la categoria seleccionada
        const { CATEGORIA_ID, CATEGORIA_NOMBRE, CATEGORIA_DESCRIPCION } = req.body;
        const newCategory = {
            CATEGORIA_NOMBRE,
            CATEGORIA_DESCRIPCION
        }
        await pool.query('UPDATE CATEGORIA set ? WHERE CATEGORIA_ID = ?', [newCategory, CATEGORIA_ID]);
        res.redirect('/administrator/category');
    },

    getAllMeasurements: async (req, res) => { //Obtenemos todas las unidades de medida
        const measure = await pool.query('SELECT * FROM MEDIDA');
        res.render('administrator/measurements', { measure });
    },

    createMeasurementsPost: async (req, res) => { //Agregamos nueva medida
        const { MEDIDA_NOMBRE } = req.body;
        await pool.query('INSERT INTO MEDIDA (MEDIDA_ID, MEDIDA_NOMBRE) VALUES (NULL, ?)', [MEDIDA_NOMBRE]);
        res.redirect('/administrator/measurements');
    },

    editMeasurementsPost: async (req, res) => { //Editamos la medida seleccionada
        const { MEDIDA_ID, MEDIDA_NOMBRE } = req.body;
        await pool.query('UPDATE MEDIDA set MEDIDA_NOMBRE = ? WHERE MEDIDA_ID = ?', [MEDIDA_NOMBRE, MEDIDA_ID]);
        res.redirect('/administrator/measurements');
    },

    getAllPresentation: async (req, res) => { //Obtenemos todas las unidades de medida
        const presentation = await pool.query('SELECT * FROM PRESENTACION');
        res.render('administrator/presentation', { presentation });
    },

    createPresentationPost: async (req, res) => { //Agremamos nueva presentacion
        const { PRESENTACION_NOMBRE } = req.body;
        await pool.query('INSERT INTO PRESENTACION (PRESENTACION_ID, PRESENTACION_NOMBRE) VALUES (NULL, ?)', [PRESENTACION_NOMBRE]);
        res.redirect('/administrator/presentation');
    },

    editPresentationPost: async (req, res) => { //Editamos la presentacion seleccionada
        console.log(req.body);
        const { PRESENTACION_ID, PRESENTACION_NOMBRE } = req.body;
        await pool.query('UPDATE PRESENTACION set PRESENTACION_NOMBRE = ? WHERE PRESENTACION_ID = ?', [PRESENTACION_NOMBRE, PRESENTACION_ID]);
        res.redirect('/administrator/presentation');
    },

}