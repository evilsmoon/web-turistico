const pool = require('../database');

var PDFDocument = require('pdfkit');

module.exports = {

    getAllBuy: async (req, res) => {
        const userId = req.user.PERSONA_ID;
        const detail = await pool.query('SELECT * FROM VENTA WHERE PERSONA_ID = ? ORDER BY VENTA.VENTA_ID DESC', [userId]);
        const lastSell = detail[0];
        console.log(lastSell);
        res.render('detail/buy', { detail, lastSell });
    },

    getDetailBuy: async (req, res) => {
        const { VENTA_ID } = req.params;
        const detailBuy = await pool.query('SELECT * FROM DETALLE_VENTA, PRODUCTO, PERSONA, DIRECCION WHERE DETALLE_VENTA.DETALLE_PRODUCTOR = PERSONA.PERSONA_ID AND PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PRODUCTO.PRODUCTO_ID = DETALLE_VENTA.PRODUCTO_ID AND DETALLE_VENTA.VENTA_ID = ?', [VENTA_ID]);
        const detailTotal = detailBuy[0];

        const pago = await pool.query('SELECT * FROM VENTA, TIPO_PAGO WHERE VENTA.PAGO_ID = TIPO_PAGO.PAGO_ID AND VENTA.VENTA_ID = ?', [VENTA_ID]);
        const detailPay = pago[0];

        const { PERSONA_ID } = req.user;
        const rows = await pool.query('SELECT * FROM PERSONA, DIRECCION WHERE PERSONA.DIRECCION_ID = DIRECCION.DIRECCION_ID AND PERSONA.PERSONA_ID = ?', [PERSONA_ID]);
        const profile = rows[0];

        const doc = new PDFDocument();

        var filename = encodeURIComponent(Math.random()) + '.pdf';
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        //Header
        doc
            .fillColor("#444444")
            .fontSize(20)
            .text("Red De Profesionales De Cotopaxi", 50, 57)
            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Fecha de compra:", 400, 65)
            .font("Helvetica")
            .text(detailPay.VENTA_FECHA, 200, 65, { align: "right" })
            .text("Cotopaxi", 200, 80, { align: "right" })
            .moveDown();

        //body
        doc
            .fillColor("#444444")
            .fontSize(15)
            .text("Datos Personales", 50, 160);

        doc.strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, 190)
            .lineTo(550, 190)
            .stroke();

        const customerInformationTop = 200;

        doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Nombre:", 50, customerInformationTop)
            .font("Helvetica")
            .text(profile.PERSONA_NOMBRE, 125, customerInformationTop)

            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Telefono:", 50, customerInformationTop + 15)
            .font("Helvetica")
            .text(profile.PERSONA_TELEFONO, 125, customerInformationTop + 15)

            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Dirección:", 50, customerInformationTop + 30)
            .font("Helvetica")
            .text(profile.PARROQUIA, 125, customerInformationTop + 30)

            .moveDown();

        doc.strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, 250)
            .lineTo(550, 250)
            .stroke();


        doc
            .fillColor("#444444")
            .fontSize(15)
            .text("Orden de Compra", 50, 300);

        //Head Table
        let invoiceTableHead = 330;

        doc.strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, invoiceTableHead + 10)
            .lineTo(550, invoiceTableHead + 10)
            .stroke();

        doc

            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Producto", 50, invoiceTableHead + 20)

            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Cantidad", 125, invoiceTableHead + 20)

            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Precio", 175, invoiceTableHead + 20)

            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Total", 225, invoiceTableHead + 20)

            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Direccion", 275, invoiceTableHead + 20)

            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Telefono", 375, invoiceTableHead + 20)

            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Productor", 440, invoiceTableHead + 20)

            .moveDown();


        doc.strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, invoiceTableHead + 35)
            .lineTo(550, invoiceTableHead + 35)
            .stroke();

        //Table        
        let invoiceTableBody = 380;

        for (const i of detailBuy) {
            doc
                .fontSize(10)
                .font("Helvetica")
                .text(i.PRODUCTO_NOMBRE, 50, invoiceTableBody)

                .fontSize(10)
                .font("Helvetica")
                .text(i.DETALLE_CANTIDAD, 125, invoiceTableBody)

                .fontSize(10)
                .font("Helvetica")
                .text(i.DETALLE_PRECIOUNITARIO, 175, invoiceTableBody)

                .fontSize(10)
                .font("Helvetica")
                .text(i.DETALLE_PRECIOTOTAL, 225, invoiceTableBody)

                .fontSize(10)
                .font("Helvetica")
                .text(i.PARROQUIA, 275, invoiceTableBody)

                .fontSize(10)
                .font("Helvetica")
                .text(i.PERSONA_TELEFONO, 375, invoiceTableBody)

                .fontSize(10)
                .font("Helvetica")
                .text(i.PERSONA_NOMBRE, 440, invoiceTableBody)

            doc.strokeColor("#aaaaaa")
                .lineWidth(1)
                .moveTo(50, invoiceTableBody + 15)
                .lineTo(550, invoiceTableBody + 15)
                .stroke();

            invoiceTableBody = invoiceTableBody + 25;
        }

        // Table foot
        doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Total: $", 190, invoiceTableBody)

            .fontSize(10)
            .font("Helvetica")
            .text(detailPay.VENTA_TOTAL, 225, invoiceTableBody)

            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Tipo de pago:", 155, invoiceTableBody + 20)

            .fontSize(10)
            .font("Helvetica")
            .text(detailPay.PAGO_NOMBRE, 225, invoiceTableBody + 20)

        doc.pipe(res);
        doc.end();

    },

    getAllSell: async (req, res) => {
        const userId = req.user.PERSONA_ID;
        var noSell = false;
        const detail = await pool.query('SELECT * FROM PERSONA, DETALLE_VENTA, VENTA, PRODUCTO, TIPO_PAGO WHERE VENTA.PERSONA_ID = PERSONA.PERSONA_ID AND VENTA.VENTA_ID = DETALLE_VENTA.VENTA_ID AND DETALLE_VENTA.PRODUCTO_ID = PRODUCTO.PRODUCTO_ID AND DETALLE_VENTA.PRODUCTO_ID = PRODUCTO.PRODUCTO_ID AND VENTA.PAGO_ID = TIPO_PAGO.PAGO_ID AND DETALLE_VENTA.DETALLE_PRODUCTOR = ? ORDER BY DETALLE_VENTA.DETALLE_ID DESC', [userId]);

        if (detail.length == 0) {
            noSell = true;
        }

        res.render('detail/sell', { detail, noSell });
    },

    getSearchSell: async (req, res) => {
        const userId = req.user.PERSONA_ID;
        const { buscar } = req.query;
        var noUser = false;

        console.log(buscar);

        if (buscar) {
            const detail = await pool.query('SELECT * FROM PERSONA, DETALLE_VENTA, VENTA, PRODUCTO, TIPO_PAGO WHERE VENTA.PERSONA_ID = PERSONA.PERSONA_ID AND VENTA.VENTA_ID = DETALLE_VENTA.VENTA_ID AND DETALLE_VENTA.PRODUCTO_ID = PRODUCTO.PRODUCTO_ID AND DETALLE_VENTA.PRODUCTO_ID = PRODUCTO.PRODUCTO_ID AND VENTA.PAGO_ID = TIPO_PAGO.PAGO_ID AND DETALLE_VENTA.DETALLE_PRODUCTOR = ? AND PERSONA.PERSONA_NOMBRE = ? ORDER BY DETALLE_VENTA.DETALLE_ID DESC', [userId, buscar]);

            if (detail.length == 0) {
                noUser = true;
            }

            res.render('detail/sell', { detail, noUser });
        } else {
            var noUser = true;
            res.render('detail/sell', { noUser });
        }

    }

}