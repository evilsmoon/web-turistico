const fs = require('fs-extra');
var md5 = require('md5');

const pool = require('../database');

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = {

    getAllProducts: async (req, res) => {
        var admin = false;
        var addProducts = false;

        const products = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, MEDIDA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA_ID = ? AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND PRODUCTO.PRODUCTO_ID NOT IN ( SELECT OFERTA.PRODUCTO_ID FROM OFERTA ) ORDER BY PRODUCTO.PRODUCTO_FECHALIMITE ASC', [req.user.PERSONA_ID]);

        const offer = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, MEDIDA, OFERTA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND OFERTA.PRODUCTO_ID = PRODUCTO.PRODUCTO_ID AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND PERSONA_ID = ? ORDER BY PRODUCTO.PRODUCTO_FECHALIMITE ASC', [req.user.PERSONA_ID]);

        const people = await pool.query('SELECT * FROM PERSONA, DIRECCION WHERE DIRECCION.DIRECCION_ID = PERSONA.DIRECCION_ID AND PERSONA_ID = ?', [req.user.PERSONA_ID]);
        const rolAdmin = people[0];

        if (rolAdmin.ROL_ID == 1) {
            admin = true;
        }

        if (products.length == 0 && offer.length == 0) {
            addProducts = true;
        }

        res.render('products/list', { products, offer, profile: people[0], admin, addProducts });
    },

    createProductPage: async (req, res) => {
        const category = await pool.query('SELECT * FROM CATEGORIA WHERE CATEGORIA_ESTADO = "ACTIVO"');
        const presentation = await pool.query('SELECT * FROM PRESENTACION WHERE PRESENTACION_ESTADO = "ACTIVO"');
        const measure = await pool.query('SELECT * FROM MEDIDA WHERE MEDIDA_ESTADO = "ACTIVO"');

        res.render('products/add', { category, presentation, measure });
    },

    createProductPost: async (req, res, cb) => {
        console.log(req.body);

        var today = new Date();
        const productDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

        const { CATEGORIA_ID, PRESENTACION_ID, MEDIDA_ID, PRODUCTO_NOMBRE, PRODUCTO_DESCRIPCION, OFERTA_DESCRIPCION, PRODUCTO_CANTIDAD, PRODUCTO_PRECIO, PRODUCTO_MEDIDA, PRODUCTO_FECHAPUBLICACION, PRODUCTO_FECHALIMITE, PRODUCTO_FECHACOCECHA, PRODUCTO_ESTADO, PRODUCTO_IMAGEN, PRODUCTO_URL } = req.body;

        const newProduct = {
            PERSONA_ID: req.user.PERSONA_ID,
            CATEGORIA_ID,
            PRESENTACION_ID,
            MEDIDA_ID,
            PRODUCTO_NOMBRE,
            PRODUCTO_DESCRIPCION,
            PRODUCTO_CANTIDAD,
            PRODUCTO_PRECIO,
            PRODUCTO_MEDIDA,
            PRODUCTO_FECHAPUBLICACION,
            PRODUCTO_FECHALIMITE,
            PRODUCTO_FECHACOCECHA,
            PRODUCTO_ESTADO,
            PRODUCTO_IMAGEN,
            PRODUCTO_URL
        };

        const findName = await pool.query('SELECT PRODUCTO_NOMBRE FROM PRODUCTO, PERSONA WHERE PRODUCTO_ESTADO = "ACTIVO" AND PRODUCTO.PERSONA_ID = PERSONA.PERSONA_ID AND PRODUCTO.PRODUCTO_NOMBRE = ? AND PRODUCTO.PRODUCTO_ID NOT IN ( SELECT OFERTA.PRODUCTO_ID FROM OFERTA) AND PERSONA.PERSONA_ID = ?', [PRODUCTO_NOMBRE, req.user.PERSONA_ID]);

        if (findName.length > 0) {
            return cb(new Error('Usted ya posee ' + PRODUCTO_NOMBRE + ' en su inventario'));
        }

        newProduct.PRODUCTO_ESTADO = 'ACTIVO';
        newProduct.PRODUCTO_NOMBRE = newProduct.PRODUCTO_NOMBRE.toUpperCase();
        newProduct.PRODUCTO_DESCRIPCION = newProduct.PRODUCTO_DESCRIPCION.toUpperCase();

        if (!newProduct.PRODUCTO_FECHAPUBLICACION) {
            newProduct.PRODUCTO_FECHAPUBLICACION = productDate;
        }

        try {
            if (req.file.path) {
                const cloudImage = await cloudinary.uploader.upload(req.file.path); //Permite guardar las imagenes en cloudinary
                newProduct.PRODUCTO_IMAGEN = cloudImage.public_id;
                newProduct.PRODUCTO_URL = cloudImage.secure_url;
                await fs.unlink(req.file.path); //Elimina las imagenes, para que no guarden de manera local
            }
        } catch {
            const cloudImage = [];
            cloudImage.public_id = 'product_iqxawz.jpg';
            cloudImage.secure_url = 'https://res.cloudinary.com/drwpai0vu/image/upload/v1617070591/product_iqxawz.jpg';
            newProduct.PRODUCTO_IMAGEN = cloudImage.public_id;
            newProduct.PRODUCTO_URL = cloudImage.secure_url;
        }

        // try {
        //     if (req.file.filename) {
        //         newProduct.PRODUCTO_IMAGEN = await req.file.filename;
        //         newProduct.PRODUCTO_URL = await 'http://localhost:3000/img/uploads/' + req.file.filename;
        //     }
        // } catch {
        //     newProduct.PRODUCTO_IMAGEN = 'product.jpg';
        //     newProduct.PRODUCTO_URL = 'http://localhost:3000/img/uploads/product.jpg';
        // }

        console.log(newProduct);//Muestra datos del formulario
        console.log(req.file);

        await pool.query('INSERT INTO PRODUCTO set ?', [newProduct]);//await le dice a la funcion que esta peticion va a tomar su tiempo

        console.log('OFERTA_DESCRIPCION: ' + OFERTA_DESCRIPCION);

        if (OFERTA_DESCRIPCION) {
            console.log('id user: ' + req.user.PERSONA_ID);
            const row = await pool.query('SELECT MAX(PRODUCTO_ID) AS ID FROM PRODUCTO, PERSONA WHERE PRODUCTO.PERSONA_ID = PERSONA.PERSONA_ID AND PERSONA.PERSONA_ID = ?', [req.user.PERSONA_ID]);
            const lastId = row[0];
            const lastProduct = lastId.ID;
            console.log('id last product: ' + lastProduct);
            const newOfert = {
                PRODUCTO_ID: lastProduct,
                OFERTA_DESCRIPCION
            };

            newOfert.OFERTA_DESCRIPCION = newOfert.OFERTA_DESCRIPCION.toUpperCase();
            console.log(newOfert);
            await pool.query('INSERT INTO OFERTA set ?', [newOfert]);
        }

        req.flash('success', 'Producto Agregado');//Almacenamos el mensaje en success
        res.redirect('/products');//redirecciona a la ruta products
    },

    deleteProduct: async (req, res) => {
        const { producto_id } = req.params;
        await pool.query('UPDATE PRODUCTO SET PRODUCTO_ESTADO = "ELIMINADO" WHERE PRODUCTO.PRODUCTO_ID = ?', [producto_id]);
        req.flash('success', 'Producto Eliminado');
        res.redirect('/products');//redireccionamos a la misma lista products
    },

    deleteOffert: async (req, res) => {
        const { producto_id } = req.params;
        console.log('ID producto oferta: ' + producto_id);
        await pool.query('DELETE FROM OFERTA WHERE PRODUCTO_ID = ?', [producto_id]);
        req.flash('success', 'Producto En Oferta Eliminado');
        res.redirect('/products');//redireccionamos a la misma lista products
    },

    editProductPage: async (req, res) => {
        const { producto_id } = req.params;

        const productsId = await pool.query('SELECT * FROM PRODUCTO WHERE PRODUCTO.PRODUCTO_ID = ?', [producto_id]);

        const products = await pool.query('SELECT * FROM PRODUCTO LEFT JOIN CATEGORIA ON PRODUCTO.CATEGORIA_ID = CATEGORIA.CATEGORIA_ID LEFT JOIN MEDIDA ON PRODUCTO.MEDIDA_ID = MEDIDA.MEDIDA_ID LEFT JOIN PRESENTACION ON PRODUCTO.PRESENTACION_ID = PRESENTACION.PRESENTACION_ID LEFT JOIN OFERTA ON PRODUCTO.PRODUCTO_ID = OFERTA.PRODUCTO_ID WHERE PRODUCTO.PRODUCTO_ID = ?', [producto_id]);

        const fechaCosecha = products[0].PRODUCTO_FECHACOCECHA.toLocaleDateString('sv-SE');
        const fechaLimite = products[0].PRODUCTO_FECHALIMITE.toLocaleDateString('sv-SE');

        const category = await pool.query('SELECT * FROM CATEGORIA WHERE CATEGORIA_ESTADO = "ACTIVO"');

        const listcategory = await pool.query('SELECT * FROM CATEGORIA WHERE CATEGORIA_ESTADO = "ACTIVO" AND CATEGORIA.CATEGORIA_ID NOT IN (SELECT CATEGORIA_ID FROM PRODUCTO WHERE PRODUCTO_ID = ?)', [producto_id]);

        const listpresentation = await pool.query('SELECT * FROM PRESENTACION WHERE PRESENTACION_ESTADO = "ACTIVO" AND PRESENTACION.PRESENTACION_ID NOT IN (SELECT PRESENTACION_ID FROM PRODUCTO WHERE PRODUCTO_ID = ?)', [producto_id]);

        const listmeasure = await pool.query('SELECT * FROM MEDIDA WHERE MEDIDA_ESTADO = "ACTIVO" AND MEDIDA.MEDIDA_ID NOT IN (SELECT MEDIDA_ID FROM PRODUCTO WHERE PRODUCTO_ID = ?)', [producto_id]);

        res.render('products/edit', { product: products[0], productId: productsId[0], category, listcategory, listpresentation, listmeasure, fechaCosecha, fechaLimite });
    },

    editProductPost: async (req, res) => {
        const { producto_id } = req.params;

        const rows = await pool.query('SELECT * FROM PRODUCTO WHERE PRODUCTO_ID = ?', [producto_id]);
        const products = rows[0];

        const { CATEGORIA_ID, PRESENTACION_ID, MEDIDA_ID, PRODUCTO_NOMBRE, PRODUCTO_DESCRIPCION, OFERTA_DESCRIPCION, PRODUCTO_CANTIDAD, PRODUCTO_PRECIO, PRODUCTO_MEDIDA, PRODUCTO_FECHAPUBLICACION, PRODUCTO_FECHALIMITE, PRODUCTO_FECHACOCECHA, PRODUCTO_ESTADO, PRODUCTO_IMAGEN, PRODUCTO_URL } = req.body;

        const newProduct = {
            CATEGORIA_ID,
            PRESENTACION_ID,
            MEDIDA_ID,
            PRODUCTO_NOMBRE,
            PRODUCTO_DESCRIPCION,
            PRODUCTO_CANTIDAD,
            PRODUCTO_PRECIO,
            PRODUCTO_MEDIDA,
            PRODUCTO_FECHAPUBLICACION,
            PRODUCTO_FECHALIMITE,
            PRODUCTO_FECHACOCECHA,
            PRODUCTO_ESTADO,
            PRODUCTO_IMAGEN,
            PRODUCTO_URL
        };

        console.log(newProduct);
        newProduct.PRODUCTO_NOMBRE = newProduct.PRODUCTO_NOMBRE.toUpperCase();
        newProduct.PRODUCTO_DESCRIPCION = newProduct.PRODUCTO_DESCRIPCION.toUpperCase();

        try {
            if (req.file.path) {
                console.log('Imagen actual');
                const cloudImage = await cloudinary.uploader.upload(req.file.path); //Permite guardar las imagenes en cloudinary
                newProduct.PRODUCTO_IMAGEN = cloudImage.public_id;
                newProduct.PRODUCTO_URL = cloudImage.secure_url;
                await fs.unlink(req.file.path); //Elimina las imagenes, para que no guarden de manera local
            }
        } catch {
            newProduct.PRODUCTO_IMAGEN = products.PRODUCTO_IMAGEN;
            newProduct.PRODUCTO_URL = products.PRODUCTO_URL;
        }

        // try {
        //     if (req.file.filename) {
        //         // await fs.unlink(products.PRODUCTO_URL);
        //         newProduct.PRODUCTO_IMAGEN = await req.file.filename;
        //         newProduct.PRODUCTO_URL = await 'http://localhost:3000/img/uploads/' + req.file.filename;
        //     }
        // } catch {
        //     newProduct.PRODUCTO_IMAGEN = products.PRODUCTO_IMAGEN;
        //     newProduct.PRODUCTO_URL = products.PRODUCTO_URL;
        // }

        newProduct.PRODUCTO_ESTADO = products.PRODUCTO_ESTADO;
        newProduct.PRODUCTO_FECHAPUBLICACION = products.PRODUCTO_FECHAPUBLICACION;

        console.log(newProduct);

        const find = await pool.query('SELECT * FROM OFERTA WHERE PRODUCTO_ID = ?', [producto_id]);

        if (find.length > 0 && OFERTA_DESCRIPCION) {
            console.log('Hacemos un update');
            offer = OFERTA_DESCRIPCION.toUpperCase();
            await pool.query('UPDATE OFERTA SET OFERTA_DESCRIPCION = ? WHERE OFERTA.PRODUCTO_ID = ?', [offer, producto_id]);

        } else if (find.length == 0 && OFERTA_DESCRIPCION) {
            console.log('Hacemos un insert');
            const newOfert = {
                PRODUCTO_ID: producto_id,
                OFERTA_DESCRIPCION
            };
            newOfert.OFERTA_DESCRIPCION = OFERTA_DESCRIPCION.toUpperCase();
            console.log(newOfert);
            await pool.query('INSERT INTO OFERTA set ?', [newOfert]);

        }
        // else if (find.length > 0 && !OFERTA_DESCRIPCION) {
        //     console.log('Hacemos un delete');
        //     await pool.query('DELETE FROM oferta WHERE PRODUCTO_ID = ?', [producto_id]);
        // }

        await pool.query('UPDATE PRODUCTO set ? WHERE PRODUCTO_ID = ?', [newProduct, producto_id]);
        req.flash('success', 'Producto Actualizado');
        res.redirect('/products');
    },

    editPeoplePage: async (req, res) => {
        const people = await pool.query('SELECT * FROM PERSONA, DIRECCION WHERE DIRECCION.DIRECCION_ID = PERSONA.DIRECCION_ID AND PERSONA_ID = ?', [req.user.PERSONA_ID]);

        res.render('products/user', { profile: people[0] });
    },

    editPeoplePost: async (req, res, cb) => {
        const { PERSONA_ID } = req.user;

        const rows = await pool.query('SELECT * FROM PERSONA WHERE PERSONA_ID = ?', [PERSONA_ID]);
        const profile = rows[0];

        const { DIRECCION_ID, ROL_ID, PERSONA_NOMBRE, PERSONA_TELEFONO, PERSONA_EMAIL, PERSONA_CONTRASENA, CONTRASENA_ANTIGUA, CONTRASENA_NUEVA, REPETIR_CONTRASENA, PERSONA_ESTADO, PERSONA_LOGIN, PERSONA_IMAGEN, PERSONA_URL } = req.body;

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

        console.log(newUser);

        if (DIRECCION_ID == 0) {
            newUser.DIRECCION_ID = profile.DIRECCION_ID;
        }

        newUser.PERSONA_NOMBRE = newUser.PERSONA_NOMBRE.toUpperCase();
        newUser.ROL_ID = profile.ROL_ID;
        newUser.PERSONA_EMAIL = profile.PERSONA_EMAIL;
        // newUser.PERSONA_CONTRASENA = profile.PERSONA_CONTRASENA;
        newUser.PERSONA_ESTADO = profile.PERSONA_ESTADO;
        newUser.PERSONA_LOGIN = profile.PERSONA_LOGIN;

        if (CONTRASENA_NUEVA) {
            const password = await pool.query('SELECT * FROM PERSONA WHERE PERSONA.PERSONA_ID = ?', [req.user.PERSONA_ID]);

            const oldPass = password[0];
            const passMd5 = md5(CONTRASENA_ANTIGUA);

            if (oldPass.PERSONA_CONTRASENA !== passMd5 || CONTRASENA_NUEVA !== REPETIR_CONTRASENA) {
                return cb(new Error('Error de ingreso de contraseñas'));
            }

            newUser.PERSONA_CONTRASENA = md5(REPETIR_CONTRASENA);

        } else {
            newUser.PERSONA_CONTRASENA = profile.PERSONA_CONTRASENA;
        }

        try {
            if (req.file.path) {
                console.log('Imagen actual');
                const cloudImage = await cloudinary.uploader.upload(req.file.path); //Permite guardar las imagenes en cloudinary
                newUser.PERSONA_IMAGEN = cloudImage.public_id;
                newUser.PERSONA_URL = cloudImage.secure_url;
                await fs.unlink(req.file.path); //Elimina las imagenes, para que no guarden de manera local
            }
        } catch {
            newUser.PERSONA_IMAGEN = profile.PERSONA_IMAGEN;
            newUser.PERSONA_URL = profile.PERSONA_URL;
        }

        // try {
        //     if (req.file.filename) {
        //         // await fs.unlink(newUser.PERSONA_URL);
        //         newUser.PERSONA_IMAGEN = await req.file.filename;
        //         newUser.PERSONA_URL = await 'http://localhost:3000/img/uploads/' + req.file.filename;
        //     }
        // } catch {
        //     newUser.PERSONA_IMAGEN = profile.PERSONA_IMAGEN;
        //     newUser.PERSONA_URL = profile.PERSONA_URL;
        // }

        console.log(newUser);
        await pool.query('UPDATE PERSONA set ? WHERE PERSONA_ID = ?', [newUser, PERSONA_ID]);
        req.flash('success', 'Usuario Modificado');
        res.redirect('/products');
    }

}