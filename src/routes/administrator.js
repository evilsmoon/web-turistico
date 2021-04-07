const express = require('express');
const router = express.Router();

const { isAdmin } = require('../lib/auth');

const {
    getAllUsers,
    getSearchUsers,
    deleteUsers,
    editUserPost,
    getAllCategory,
    createCategoryPost,
    editCategoryPost,
    getAllMeasurements,
    createMeasurementsPost,
    editMeasurementsPost,
    getAllPresentation,
    createPresentationPost,
    editPresentationPost
} = require('../controllers/administrator');

router.get('/users', isAdmin, getAllUsers); //Obtenemos todos los usuarios inactivos
router.get('/users/search', isAdmin, getSearchUsers); //Buscar usuarios por su nombre
router.post('/users/edit', isAdmin, editUserPost); //Modificar el estado del usario
router.get('/delete/:id', isAdmin, deleteUsers); //Eliminamos usuarios por su ID

router.get('/category', isAdmin, getAllCategory); //Obtenemos todas los categorias
router.post('/category', isAdmin, createCategoryPost); //Agregamos nueva categoria
router.post('/category/edit', isAdmin, editCategoryPost); //Editamos la categoria seleccionada

router.get('/measurements', isAdmin, getAllMeasurements); //Obtenemos todas las unidades de medida
router.post('/measurements', isAdmin, createMeasurementsPost); //Agregamos nueva medida
router.post('/measurements/edit', isAdmin, editMeasurementsPost); //Editamos la medida seleccionada

router.get('/presentation', isAdmin, getAllPresentation); //Obtenemos todas las unidades de medida
router.post('/presentation', isAdmin, createPresentationPost); //Agremamos nueva presentacion
router.post('/presentation/edit', isAdmin, editPresentationPost); //Editamos la presentacion seleccionada

module.exports = router;