const pool = require('../database');
const Cart = require('../models/cart');

module.exports = {

    getAllProducts: async (req, res) => {
        var findProducts = false;

        const category = await pool.query('SELECT * FROM CATEGORIA WHERE CATEGORIA_ESTADO = "ACTIVO"');

        try {
            const products = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND PRODUCTO.PRODUCTO_ID NOT IN ( SELECT OFERTA.PRODUCTO_ID FROM OFERTA) AND PERSONA.PERSONA_ID NOT IN ( ? )', [req.user.PERSONA_ID]);

            if (products.length == 0) {
                findProducts = true;
            }

            const numProducts = products.length;
            const numOffers = '0';

            res.render('store/shop', { products, category, findProducts, numProducts, numOffers });
        } catch {
            const products = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND PRODUCTO.PRODUCTO_ID NOT IN ( SELECT OFERTA.PRODUCTO_ID FROM OFERTA)');

            if (products.length == 0) {
                findProducts = true;
            }

            const numProducts = products.length;
            const numOffers = '0';

            res.render('store/shop', { products, category, findProducts, numProducts, numOffers });
        }
    },

    getSearchProducts: async (req, res) => {
        const { buscar } = req.query;
        var findProducts = false;

        const category = await pool.query('SELECT * FROM CATEGORIA WHERE CATEGORIA_ESTADO = "ACTIVO"');

        try {
            if (buscar) {
                const products = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PRODUCTO.PRODUCTO_NOMBRE = ? AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND PRODUCTO.PRODUCTO_ID NOT IN ( SELECT OFERTA.PRODUCTO_ID FROM OFERTA) AND PERSONA.PERSONA_ID NOT IN ( ? )', [buscar, req.user.PERSONA_ID]);

                const offer = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA, OFERTA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND OFERTA.PRODUCTO_ID = PRODUCTO.PRODUCTO_ID AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND PRODUCTO.PRODUCTO_NOMBRE = ? AND PERSONA.PERSONA_ID NOT IN ( ? )', [buscar, req.user.PERSONA_ID]);

                if (products.length == 0 && offer.length == 0) {
                    findProducts = true;
                }

                const numProducts = products.length;
                const numOffers = offer.length;

                res.render('store/shop', { products, category, offer, findProducts, numProducts, numOffers });
            } else {
                findProducts = true;
                const numProducts = '0';
                const numOffers = '0';
                res.render('store/shop', { category, findProducts, numProducts, numOffers });
            }
        } catch {
            if (buscar) {
                const products = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND PRODUCTO.PRODUCTO_ID NOT IN ( SELECT OFERTA.PRODUCTO_ID FROM OFERTA) AND PRODUCTO_NOMBRE = ?', [buscar]);

                const offer = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA, OFERTA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND OFERTA.PRODUCTO_ID = PRODUCTO.PRODUCTO_ID AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND PRODUCTO.PRODUCTO_NOMBRE = ?', [buscar]);

                if (products.length == 0 && offer.length == 0) {
                    findProducts = true;
                }

                const numProducts = products.length;
                const numOffers = offer.length;

                res.render('store/shop', { products, offer, category, findProducts, numProducts, numOffers });
            } else {
                findProducts = true;
                const numProducts = '0';
                const numOffers = '0';

                res.render('store/shop', { category, findProducts, numProducts, numOffers });
            }
        }
    },

    getPlaceProducts: async (req, res) => {
        const { DIRECCION_ID } = req.query;
        var findProducts = false;

        const category = await pool.query('SELECT * FROM CATEGORIA WHERE CATEGORIA_ESTADO = "ACTIVO"');

        try {
            if (DIRECCION_ID !== '0') {
                const products = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND DIRECCION.DIRECCION_ID = ? AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND PRODUCTO.PRODUCTO_ID NOT IN ( SELECT OFERTA.PRODUCTO_ID FROM OFERTA) AND PERSONA.PERSONA_ID NOT IN ( ? )', [DIRECCION_ID, req.user.PERSONA_ID]);

                const offer = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA, OFERTA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND OFERTA.PRODUCTO_ID = PRODUCTO.PRODUCTO_ID AND DIRECCION.DIRECCION_ID = ? AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND PERSONA.PERSONA_ID NOT IN ( ? )', [DIRECCION_ID, req.user.PERSONA_ID]);

                if (products.length == 0 && offer.length == 0) {
                    findProducts = true;
                }

                const numProducts = products.length;
                const numOffers = offer.length;

                res.render('store/shop', { products, offer, category, findProducts, numProducts, numOffers });
            } else {
                findProducts = true;
                const numProducts = '0';
                const numOffers = '0';

                res.render('store/shop', { category, findProducts, numProducts, numOffers });
            }
        } catch {
            if (DIRECCION_ID !== '0') {
                const products = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND PRODUCTO.PRODUCTO_ID NOT IN ( SELECT OFERTA.PRODUCTO_ID FROM OFERTA) AND DIRECCION.DIRECCION_ID = ?', [DIRECCION_ID]);

                const offer = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA, OFERTA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND OFERTA.PRODUCTO_ID = PRODUCTO.PRODUCTO_ID AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND DIRECCION.DIRECCION_ID = ?', [DIRECCION_ID]);

                if (products.length == 0 && offer.length == 0) {
                    findProducts = true;
                }
                const numProducts = products.length;
                const numOffers = offer.length;

                res.render('store/shop', { products, offer, category, findProducts, numProducts, numOffers });
            } else {
                findProducts = true;
                const numProducts = '0';
                const numOffers = '0';

                res.render('store/shop', { category, findProducts, numProducts, numOffers });
            }
        }

    },

    getCategoryProducts: async (req, res) => {
        const { CATEGORIA_ID } = req.query;
        var findProducts = false;

        const category = await pool.query('SELECT * FROM CATEGORIA WHERE CATEGORIA_ESTADO = "ACTIVO"');

        try {
            if (CATEGORIA_ID) {
                const products = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND CATEGORIA.CATEGORIA_ID = ? AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND PRODUCTO.PRODUCTO_ID NOT IN ( SELECT OFERTA.PRODUCTO_ID FROM OFERTA) AND PERSONA.PERSONA_ID NOT IN ( ? )', [CATEGORIA_ID, req.user.PERSONA_ID]);

                const offer = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA, OFERTA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND OFERTA.PRODUCTO_ID = PRODUCTO.PRODUCTO_ID AND CATEGORIA.CATEGORIA_ID = ? AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND PERSONA.PERSONA_ID NOT IN ( ? )', [CATEGORIA_ID, req.user.PERSONA_ID]);

                if (products.length == 0 && offer.length == 0) {
                    findProducts = true;
                }
                const numProducts = products.length;
                const numOffers = offer.length;

                res.render('store/shop', { products, offer, category, findProducts, numProducts, numOffers });
            } else {
                findProducts = true;
                const numProducts = '0';
                const numOffers = '0';

                res.render('store/shop', { category, findProducts, numProducts, numOffers });
            }
        } catch {
            if (CATEGORIA_ID) {
                const products = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND PRODUCTO.PRODUCTO_ID NOT IN ( SELECT OFERTA.PRODUCTO_ID FROM OFERTA) AND CATEGORIA.CATEGORIA_ID = ?', [CATEGORIA_ID]);

                const offer = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA, OFERTA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND OFERTA.PRODUCTO_ID = PRODUCTO.PRODUCTO_ID AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND CATEGORIA.CATEGORIA_ID = ?', [CATEGORIA_ID]);

                if (products.length == 0 && offer.length == 0) {
                    findProducts = true;
                }
                const numProducts = products.length;
                const numOffers = offer.length;

                res.render('store/shop', { products, offer, category, findProducts, numProducts, numOffers });
            } else {
                findProducts = true;
                const numProducts = '0';
                const numOffers = '0';

                res.render('store/shop', { category, findProducts, numProducts, numOffers });
            }
        }
    },

    getOfferProducts: async (req, res) => {
        var findProducts = false;

        const category = await pool.query('SELECT * FROM CATEGORIA WHERE CATEGORIA_ESTADO = "ACTIVO"');

        try {
            const offer = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA, OFERTA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND OFERTA.PRODUCTO_ID = PRODUCTO.PRODUCTO_ID AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND PERSONA.PERSONA_ID NOT IN ( ? )', [req.user.PERSONA_ID]);

            if (offer.length == 0) {
                findProducts = true;
            }

            const numOffers = offer.length;
            const numProducts = '0';

            res.render('store/offer', { offer, category, findProducts, numProducts, numOffers });
        } catch {
            const offer = await pool.query('SELECT * FROM PRODUCTO, CATEGORIA, PRESENTACION, PERSONA, DIRECCION, MEDIDA, OFERTA WHERE CATEGORIA.CATEGORIA_ID = PRODUCTO.CATEGORIA_ID AND PRESENTACION.PRESENTACION_ID = PRODUCTO.PRESENTACION_ID AND MEDIDA.MEDIDA_ID = PRODUCTO.MEDIDA_ID AND PRODUCTO_ESTADO = "ACTIVO" AND PERSONA.PERSONA_ID = PRODUCTO.PERSONA_ID AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PRODUCTO.PRODUCTO_CANTIDAD NOT IN (0) AND OFERTA.PRODUCTO_ID = PRODUCTO.PRODUCTO_ID');

            if (offer.length == 0) {
                findProducts = true;
            }
            const numProducts = '0';
            const numOffers = offer.length;

            res.render('store/offer', { offer, category, findProducts, numProducts, numOffers });
        }

    },

    addToCart: async (req, res) => {
        const { PRODUCTO_ID } = req.body;

        const add = await pool.query('SELECT * FROM PRODUCTO LEFT JOIN CATEGORIA ON PRODUCTO.CATEGORIA_ID = CATEGORIA.CATEGORIA_ID LEFT JOIN MEDIDA ON PRODUCTO.MEDIDA_ID = MEDIDA.MEDIDA_ID LEFT JOIN PRESENTACION ON PRODUCTO.PRESENTACION_ID = PRESENTACION.PRESENTACION_ID LEFT JOIN PERSONA ON PRODUCTO.PERSONA_ID = PERSONA.PERSONA_ID LEFT JOIN DIRECCION ON PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID LEFT JOIN OFERTA ON PRODUCTO.PRODUCTO_ID = OFERTA.PRODUCTO_ID WHERE PRODUCTO.PRODUCTO_ID = ?', [PRODUCTO_ID]);
        const addedProduct = add[0];

        const addId = await pool.query('SELECT * FROM PRODUCTO WHERE PRODUCTO.PRODUCTO_ID = ?', [PRODUCTO_ID]);
        const productsId = addId[0];

        try {
            if (req.user.PERSONA_ID) {
                const idUser = req.user.PERSONA_ID;
                Cart.save(productsId, addedProduct, idUser);
                res.redirect('/cart');
            }
        } catch {
            req.flash('message', 'Primero Debe Iniciar Sesión Para Comprar');
            res.redirect('/signin');
        }

    },

    getCart: async (req, res) => {
        const idUser = req.user.PERSONA_ID;

        const products = Cart.getCart(idUser);

        var total = products.reduce((sum, value) => (typeof value.PRODUCTO_PRECIO == "number" ? sum + value.PRODUCTO_PRECIO : sum), 0);// Sumar total productos

        var totalPrice = total.toFixed(2);

        res.render('store/cart', { products, totalPrice });
    },

    maxInCart: async (req, res) => {
        const idUser = req.user.PERSONA_ID;
        const { PRODUCTO_ID } = req.body;
        Cart.maxCart(idUser, PRODUCTO_ID);
        res.redirect('/cart');
    },

    minInCart: async (req, res) => {
        const idUser = req.user.PERSONA_ID;
        const { PRODUCTO_ID } = req.body;
        Cart.minCart(idUser, PRODUCTO_ID);
        res.redirect('/cart');
    },

    deleteInCart: async (req, res) => {
        const idUser = req.user.PERSONA_ID;
        const { PRODUCTO_ID } = req.body;
        Cart.delete(idUser, PRODUCTO_ID);
        res.redirect('/cart');
    },

    deleteCart: async (req, res) => {
        const idUser = req.user.PERSONA_ID;
        Cart.deleteCart(idUser);
        req.flash('message', 'Carrito vaciado correctamente');
        res.redirect('/products');
    },

    buyCart: async (req, res, cb) => {
        const userId = req.user.PERSONA_ID;
        let boolBuy = [];
        var today = new Date();
        const sellDate = today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear();

        const products = Cart.getCart(userId);
        var total = products.reduce((sum, value) => (typeof value.PRODUCTO_PRECIO == "number" ? sum + value.PRODUCTO_PRECIO : sum), 0);// Sumar total productos
        var totalPrice = total.toFixed(2);

        const { PAGO_ID, VENTA_FECHA } = req.body;

        for (const i in products) { //Recorrer indices de productos comprados
            console.log(products[i]);
        }

        for (let i of products) {

            const addId = await pool.query('SELECT * FROM PRODUCTO WHERE PRODUCTO.PRODUCTO_ID = ?', [i.PRODUCTO_ID]);
            const productsId = addId[0];

            if (i.PRODUCTO_CANTIDAD <= productsId.PRODUCTO_CANTIDAD) {
                // boolBuy.push({ idUser: userId, ESTADO: true });
            } else {
                boolBuy.push({ idUser: userId, ESTADO: false });
            }

        }

        const isExisting = boolBuy.find(element => element.idUser == userId && element.ESTADO == false);

        if (isExisting) {
            req.flash('message', 'No se pudo realizar su compra, porque uno de los productos que deseaba comprar ya no se encuenta en stock o no posee la cantidad que usted desea comprar, por favor eliminelo de su lista de compra o modifique su cantidad');
            res.redirect('/cart/errorbuy');
        } else {
            const newSell = {
                PERSONA_ID: req.user.PERSONA_ID,
                PAGO_ID,
                VENTA_FECHA,
                VENTA_TOTAL: totalPrice
            }

            newSell.VENTA_FECHA = sellDate;

            if (!newSell.PAGO_ID) {
                newSell.PAGO_ID = '1';
            }

            console.log(newSell);

            try {
                await pool.query('INSERT INTO VENTA set ?', [newSell]);
            } catch (error) {
                return cb(new Error('Error al realizar la compra'));
            }

            const row = await pool.query('SELECT MAX(VENTA_ID) AS ID FROM VENTA, PERSONA WHERE VENTA.PERSONA_ID = PERSONA.PERSONA_ID AND PERSONA.PERSONA_ID = ?', [req.user.PERSONA_ID]);
            const lastId = row[0];
            const lastSell = lastId.ID;
            const activado = 'ACTIVO';

            for (let i of products) {
                const detailSell = {
                    VENTA_ID: lastSell,
                    PRODUCTO_ID: i.PRODUCTO_ID,
                    DETALLE_OFERTA: i.OFERTA_DESCRIPCION,
                    DETALLE_OFERTA: activado,
                    DETALLE_CANTIDAD: i.PRODUCTO_CANTIDAD,
                    DETALLE_PRECIOUNITARIO: i.PRECIO_UNITARIO,
                    DETALLE_PRECIOTOTAL: i.PRODUCTO_PRECIO,
                    DETALLE_PRODUCTOR: i.PERSONA_ID,
                    VISIBLE_COMPRADOR: activado,
                    VISIBLE_VENDEDOR: activado,
                }

                console.log(detailSell);

                await pool.query('INSERT INTO DETALLE_VENTA SET ?', [detailSell]);
            }

            // Aplicar un update al producto comprado, restando su stock
            for (let i of products) {
                const addId = await pool.query('SELECT * FROM PRODUCTO WHERE PRODUCTO.PRODUCTO_ID = ?', [i.PRODUCTO_ID]);
                const productsId = addId[0];

                const stock = productsId.PRODUCTO_CANTIDAD - i.PRODUCTO_CANTIDAD

                await pool.query('UPDATE PRODUCTO SET PRODUCTO_CANTIDAD = ? WHERE PRODUCTO.PRODUCTO_ID = ?', [stock, i.PRODUCTO_ID]);
            }

            Cart.deleteCart(userId);

            req.flash('success', 'Compra exitosa, por favor revise su factura');
            res.redirect('/detail/buy');
        }
    },

    errorCart: async (req, res) => {
        const userId = req.user.PERSONA_ID;
        let stockProduct = [];

        const products = Cart.getCart(userId);

        for (let i of products) {

            const addId = await pool.query('SELECT * FROM PRODUCTO WHERE PRODUCTO.PRODUCTO_ID = ?', [i.PRODUCTO_ID]);
            const productsId = addId[0];

            if (i.PRODUCTO_CANTIDAD <= productsId.PRODUCTO_CANTIDAD) {
                // boolBuy.push({ idUser: userId, ESTADO: true });
            } else {
                stockProduct.push({
                    idUser: userId,
                    PRODUCTO_NOMBRE: productsId.PRODUCTO_NOMBRE,
                    PRODUCTO_CANTIDAD: productsId.PRODUCTO_CANTIDAD,
                    CANTIDAD_ACTUAL: i.PRODUCTO_CANTIDAD
                });
            }
        }

        var productStock = stockProduct.filter(function (userProduct) { return userProduct.idUser == userId; });

        res.render('store/errorbuy', { productStock });
    }
};