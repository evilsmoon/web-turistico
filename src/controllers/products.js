const pool = require('../database');

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const fs = require('fs-extra');

module.exports = {

    getAllProducts: async (req, res) => {
        var admin = false;

        const products = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, MEDIDA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "Verdadero" AND PERSONA_ID = ? AND PRODUCTO.PRODUCTO_ID NOT IN ( SELECT OFERTA.PRODUCTO_ID FROM OFERTA )', [req.user.PERSONA_ID]);

        const offer = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, MEDIDA, OFERTA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "Verdadero" AND OFERTA.PRODUCTO_ID = PRODUCTO.PRODUCTO_ID AND PERSONA_ID = ?', [req.user.PERSONA_ID]);

        const people = await pool.query('SELECT * FROM PERSONA, DIRECCION WHERE DIRECCION.DIRECCION_ID = PERSONA.DIRECCION_ID AND PERSONA_ID = ?', [req.user.PERSONA_ID]);
        const rolAdmin = people[0];

        if (rolAdmin.ROL_ID == 1) {
            console.log('Entro user admin');
            admin = true;
        }

        res.render('products/list', { products, offer, profile: people[0], admin });
    },

    createProductPage: async (req, res) => {
        const category = await pool.query('SELECT * FROM CATEGORIA WHERE CATEGORIA_ESTADO = "Verdadero"');
        const presentation = await pool.query('SELECT * FROM PRESENTACION WHERE PRESENTACION_ESTADO = "Verdadero"');
        const measure = await pool.query('SELECT * FROM MEDIDA WHERE MEDIDA_ESTADO = "Verdadero"');

        res.render('products/add', { category, presentation, measure });
    },

    createProductPost: async (req, res) => {
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

        newProduct.PRODUCTO_ESTADO = 'Verdadero';

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

        console.log(newProduct);//Muestra datos del formulario        

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
            console.log(newOfert);
            await pool.query('INSERT INTO OFERTA set ?', [newOfert]);
        }

        req.flash('success', 'Producto Agregado');//Almacenamos el mensaje en success
        res.redirect('/products');//redirecciona a la ruta products
    },

    deleteProduct: async (req, res) => {
        const { producto_id } = req.params;
        await pool.query('UPDATE PRODUCTO SET PRODUCTO_ESTADO = "Falso" WHERE PRODUCTO.PRODUCTO_ID = ?', [producto_id]);
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

        const category = await pool.query('SELECT * FROM CATEGORIA WHERE CATEGORIA_ESTADO = "Verdadero"');

        const listcategory = await pool.query('SELECT * FROM CATEGORIA WHERE CATEGORIA_ESTADO = "Verdadero" AND CATEGORIA.CATEGORIA_ID NOT IN (SELECT CATEGORIA_ID FROM PRODUCTO WHERE PRODUCTO_ID = ?)', [producto_id]);

        const listpresentation = await pool.query('SELECT * FROM PRESENTACION WHERE PRESENTACION_ESTADO = "Verdadero" AND PRESENTACION.PRESENTACION_ID NOT IN (SELECT PRESENTACION_ID FROM PRODUCTO WHERE PRODUCTO_ID = ?)', [producto_id]);

        const listmeasure = await pool.query('SELECT * FROM MEDIDA WHERE MEDIDA_ESTADO = "Verdadero" AND MEDIDA.MEDIDA_ID NOT IN (SELECT MEDIDA_ID FROM PRODUCTO WHERE PRODUCTO_ID = ?)', [producto_id]);

        res.render('products/edit', { product: products[0], productId: productsId[0], category, listcategory, listpresentation, listmeasure });
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

        newProduct.PRODUCTO_ESTADO = products.PRODUCTO_ESTADO;
        newProduct.PRODUCTO_FECHAPUBLICACION = products.PRODUCTO_FECHAPUBLICACION;
        newProduct.PRODUCTO_FECHACOCECHA = products.PRODUCTO_FECHACOCECHA
        newProduct.PRODUCTO_FECHALIMITE = products.PRODUCTO_FECHALIMITE;

        console.log(newProduct);

        const find = await pool.query('SELECT * FROM OFERTA WHERE PRODUCTO_ID = ?', [producto_id]);

        if (find.length > 0 && OFERTA_DESCRIPCION) {
            console.log('Hacemos un update');
            await pool.query('UPDATE OFERTA SET OFERTA_DESCRIPCION = ? WHERE OFERTA.PRODUCTO_ID = ?', [OFERTA_DESCRIPCION, producto_id]);

        } else if (find.length == 0 && OFERTA_DESCRIPCION) {
            console.log('Hacemos un insert');
            const newOfert = {
                PRODUCTO_ID: producto_id,
                OFERTA_DESCRIPCION
            };
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

    //
    //
    //
    //

    editPeoplePage: async (req, res) => {
        const people = await pool.query('SELECT * FROM PERSONA, DIRECCION WHERE DIRECCION.DIRECCION_ID = PERSONA.DIRECCION_ID AND PERSONA_ID = ?', [req.user.PERSONA_ID]);

        res.render('products/user', { profile: people[0] });
    },

    editPeoplePost: async (req, res) => {
        console.log(req.body);
        const { PERSONA_ID } = req.user;

        const rows = await pool.query('SELECT * FROM PERSONA WHERE PERSONA_ID = ?', [PERSONA_ID]);
        const profile = rows[0];

        const { DIRECCION_ID, ROL_ID, PERSONA_NOMBRE, PERSONA_TELEFONO, PERSONA_EMAIL, PERSONA_CONTRASENA, PERSONA_ESTADO, PERSONA_LOGIN, PERSONA_IMAGEN, PERSONA_URL } = req.body;

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

        newUser.ROL_ID = profile.ROL_ID;
        newUser.PERSONA_EMAIL = profile.PERSONA_EMAIL;
        newUser.PERSONA_CONTRASENA = profile.PERSONA_CONTRASENA;
        newUser.PERSONA_ESTADO = profile.PERSONA_ESTADO;
        newUser.PERSONA_LOGIN = profile.PERSONA_LOGIN;

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

        console.log(newUser);
        await pool.query('UPDATE PERSONA set ? WHERE PERSONA_ID = ?', [newUser, PERSONA_ID]);
        req.flash('success', 'Usuario Modificado');
        res.redirect('/products');
    }

}