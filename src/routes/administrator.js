const express = require('express');
const router = express.Router();

const pool = require('../database');

const { isAdmin } = require('../lib/auth');

const {
    activeUserGet,
    activeUserSearch,
    activeUserPost,
    activeAdminGet,
    activeAdminSearch,
    activeAdminPost,
    deleteUserGet,
    deleteUserSearch,
    deleteUserPost,
    getAllCategory,
    createCategoryPost,
    deleteCategory,
    getAllMeasurements,
    createMeasurementsPost,
    deleteMeasurements,
    getAllPresentation,
    createPresentationPost,
    deletePresentation,
    getAllInformation,
    createInformationPost,
    deleteInformation
} = require('../controllers/administrator');

router.get('/users', isAdmin, activeUserGet); //Obtenemos la pagina de usuarios eliminados
router.get('/users/search', isAdmin, activeUserSearch); //Buscar usuarios por su nombre
router.get('/active/:id', isAdmin, activeUserPost); //Activamos usuario por su ID

router.get('/addAdmin', isAdmin, activeAdminGet); //Obtenemos la pagina de admin
router.get('/addAdmin/search', isAdmin, activeAdminSearch); //Buscar usuarios por su nombre
router.get('/activeAdmin/:id', isAdmin, activeAdminPost); //Damos permisos de administrador al usuario

router.get('/addUser', isAdmin, deleteUserGet); //Obtenemos la pagina de eliminar usuario
router.get('/addUser/search', isAdmin, deleteUserSearch); //Buscar usuarios por su nombre
router.get('/deleteUser/:id', isAdmin, deleteUserPost); //Eliminamos usuario de la aplicacion web

router.get('/category', isAdmin, getAllCategory); //Obtenemos todas los categorias
router.post('/category', isAdmin, createCategoryPost); //Agregamos nueva categoria
router.get('/category/:id', isAdmin, deleteCategory); //Eliminamos la categoria seleccionada

router.get('/measurements', isAdmin, getAllMeasurements); //Obtenemos todas las unidades de medida
router.post('/measurements', isAdmin, createMeasurementsPost); //Agregamos nueva medida
router.get('/measurements/:id', isAdmin, deleteMeasurements); //Eliminamos la medida seleccionada

router.get('/presentation', isAdmin, getAllPresentation); //Obtenemos todas las unidades de medida
router.post('/presentation', isAdmin, createPresentationPost); //Agremamos nueva presentacion
router.get('/presentation/:id', isAdmin, deletePresentation); //Eliminamos la presentacion seleccionada

router.get('/information', isAdmin, getAllInformation); //Obtenemos todos las noticias
router.post('/information', isAdmin, createInformationPost); //Agremamos nuevas noticias
router.get('/information/:id', isAdmin, deleteInformation); //Eliminamos la noticia seleccionada

router.get('/listusers', isAdmin, async (req, res) => {
    const listusers = await pool.query('SELECT PERSONA_NOMBRE FROM PERSONA');
    res.json({
        listusers
    })
});

module.exports = router;