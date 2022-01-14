const nodemailer = require('nodemailer');

const mail = {
    user: 'cotopaxisalesiana@gmail.com',
    pass: 'vuoqjbtniywcwujo'
}

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: mail.user, // generated ethereal user
        pass: mail.pass, // generated ethereal password
    },
});

const getTemplate = (name, link) => {
    return `
      <head>
          <link rel="stylesheet" href="./style.css">
      </head>
      
      <div id="email___content">      
        <h2>Red de Profesionales de Cotopaxi</h2>
        <h3>Hola ${name}</h3>
        <p>
        Confirmar cuenta,
        <a href="${link}" target="_blank">Ingresa Aquí</a>
        </p>
      </div>
    `;
}

const sendEmail = async (email, subject, html) => {
    try {

        await transporter.sendMail({
            from: `CotopaxiUps <${mail.user}>`, // sender address
            to: email, // list of receivers
            subject, // Subject line
            text: "Validación del token", // plain text body
            html, // html body
        });

    } catch (error) {
        console.log('Algo no va bien con el email', error);
    }
};

module.exports = {
    sendEmail,
    getTemplate
}