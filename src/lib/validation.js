const yup = require('yup');

function validate(validation) {
    return (req, res, next) => {
        try {
            validation(req.body);
            next();
        } catch (error) {
            next(error);
        }
    };
}

/**Yes, zero is a valid number and reasonable value generally. number.required().moreThan(0), You can right a custom test if you specifically only want to reject when === 0.

Unfortunately i can't do this test, because the value can be negative.

I solve the problem with this test:

yup
.number()
.notOneOf([0], 'my message')
.typeError('my message') */


function createUsersValidation(data) {
    const schema = yup.object().shape({
        PERSONA_NOMBRE: yup.string()
            .min(10, 'Campo nombre mínimo 10 caracteres')
            .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$/g, 'Campo nombre solo debe de tener letras')
            .required('Campo nombre requerido'),

        PERSONA_TELEFONO: yup.string()
            .min(8, 'Campo telefono mínimo 8 caracteres')
            .matches(/^[0-9]+$/, 'Campo telefono solo debe de tener números')
            .required('Campo telefono requerido'),

        PERSONA_EMAIL: yup.string()
            .email('Correo electronico inválido')
            .required('Campo email requerido'),

        PERSONA_CONTRASENA: yup.string()
            .min(5, 'Campo contraseña mínimo 5 caracteres')
            .required('Campo contraseña requerido'),

        DIRECCION_ID: yup.number()
            .moreThan(0, 'Error en el campo dirección')
            .required('Campo dirección requerido'),

    });

    schema.validateSync(data);
}

function loginValidation(data) {
    const schema = yup.object().shape({
        email: yup.string()
            .email('Correo electronico inválido')
            .required('Campo email requerido'),

        password: yup.string()
            .min(5, 'Campo contraseña mínimo 5 caracteres')
            .required('Campo contraseña requerido'),
    });

    schema.validateSync(data);
}

function editUsersValidation(data) {
    const schema = yup.object().shape({
        PERSONA_NOMBRE: yup.string()
            .min(10, 'Campo nombre mínimo 10 caracteres')
            .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$/g, 'Campo nombre solo debe de tener letras')
            .required('Campo nombre requerido'),

        PERSONA_TELEFONO: yup.string()
            .min(8, 'Campo telefono mínimo 8 caracteres')
            .matches(/^[0-9]+$/, 'Campo telefono solo debe de tener números')
            .required('Campo telefono requerido'),

    });

    schema.validateSync(data);

    const { CONTRASENA_ANTIGUA, CONTRASENA_NUEVA, REPETIR_CONTRASENA } = data;

    if (CONTRASENA_ANTIGUA.length > 0 || CONTRASENA_NUEVA.length > 0 || REPETIR_CONTRASENA.length > 0) {

        if (CONTRASENA_ANTIGUA.length < 5) {
            throw new Error('Campo contraseña antigua debe tener mínimo 5 caracteres');
        }

        if (CONTRASENA_NUEVA.length < 5) {
            throw new Error('Campo contraseña nueva debe tener mínimo 5 caracteres');
        }

        if (REPETIR_CONTRASENA.length < 5) {
            throw new Error('Campo repetir contraseña debe tener mínimo 5 caracteres');
        }

    }
}

function createProductsValidation(data) {
    const schema = yup.object().shape({
        PRODUCTO_NOMBRE: yup.string()
            .min(3, 'Campo nombre mínimo 3 caracteres')
            .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$/g, 'Campo nombre solo debe de tener letras')
            .required('Campo nombre requerido'),

        PRODUCTO_CANTIDAD: yup.string()
            .min(1, 'Campo cantidad mínimo 1 valor')
            .matches(/^[0-9]+$/, 'Campo cantidad solo debe de tener números')
            .required('Campo cantidad requerido'),

        PRODUCTO_PRECIO: yup.string()
            .min(1, 'Campo precio mínimo 1 valor')
            .matches(/^\d+(?:.\d+)?$/, 'Campo precio solo debe de tener números')
            .required('Campo precio requerido'),

        PRODUCTO_MEDIDA: yup.string()
            .min(1, 'Campo medida mínimo 1 valor')
            .matches(/^\d+(?:.\d+)?$/, 'Campo peso solo debe de tener números')
            .required('Campo peso requerido'),

        PRODUCTO_DESCRIPCION: yup.string()
            .min(10, 'Campo descripción debe tener mínimo 10 caracteres')
            .required('Campo contraseña requerido'),

        PRODUCTO_FECHACOCECHA: yup.date()
            .max(new Date(), 'El campo fecha de cocecha debe ser menor al del día de hoy')
            .required('Campo fecha de cocecha requerido'),

        PRODUCTO_FECHALIMITE: yup.date()
            .min(new Date(), 'El campo fecha limite debe ser mayor al del día de hoy')
            .required('Campo fecha limite requerido'),

        PRODUCTO_CANTIDAD: yup.number()
            .moreThan(0, 'Campo cantidad debe ser mayor a 0')
            .required('Campo dirección requerido'),

        PRODUCTO_PRECIO: yup.number()
            .moreThan(0, 'Campo precio debe ser mayor a 0')
            .required('Campo dirección requerido'),

        PRODUCTO_MEDIDA: yup.number()
            .moreThan(0, 'Campo peso debe ser mayor a 0')
            .required('Campo dirección requerido'),

        CATEGORIA_ID: yup.number()
            .moreThan(0, 'Error en el campo categoria')
            .required('Campo dirección requerido'),

        PRESENTACION_ID: yup.number()
            .moreThan(0, 'Error en el campo presentación')
            .required('Campo dirección requerido'),

        MEDIDA_ID: yup.number()
            .moreThan(0, 'Error en el campo unidad de medida')
            .required('Campo dirección requerido'),
    });

    schema.validateSync(data);

    const { OFERTA_DESCRIPCION } = data;

    if (OFERTA_DESCRIPCION.length > 0) {
        if (OFERTA_DESCRIPCION.length < 5) {
            throw new Error('Campo oferta debe tener mínimo 10 caracteres');
        }
    }

}

function editProductsValidation(data) {
    const schema = yup.object().shape({
        PRODUCTO_NOMBRE: yup.string()
            .min(4, 'Campo nombre mínimo 4 caracteres')
            .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$/g, 'Campo nombre solo debe de tener letras')
            .required('Campo nombre requerido'),

        PRODUCTO_CANTIDAD: yup.string()
            .min(1, 'Campo cantidad mínimo 1 valor')
            .matches(/^[0-9]+$/, 'Campo cantidad solo debe de tener números')
            .required('Campo cantidad requerido'),

        PRODUCTO_PRECIO: yup.string()
            .min(1, 'Campo precio mínimo 1 valor')
            .matches(/^\d+(?:.\d+)?$/, 'Campo precio solo debe de tener números')
            .required('Campo precio requerido'),

        PRODUCTO_MEDIDA: yup.string()
            .min(1, 'Campo medida mínimo 1 valor')
            .matches(/^\d+(?:.\d+)?$/, 'Campo peso solo debe de tener números')
            .required('Campo peso requerido'),

        PRODUCTO_DESCRIPCION: yup.string()
            .min(10, 'Campo descripción debe tener mínimo 10 caracteres')
            .required('Campo contraseña requerido'),

        PRODUCTO_FECHACOCECHA: yup.date()
            .max(new Date(), 'El campo fecha de cocecha debe ser menor al del día de hoy')
            .required('Campo fecha de cocecha requerido'),

        PRODUCTO_FECHALIMITE: yup.date()
            .min(new Date(), 'El campo fecha limite debe ser mayor al del día de hoy')
            .required('Campo fecha limite requerido'),

        PRODUCTO_CANTIDAD: yup.number()
            .moreThan(0, 'Campo cantidad debe ser mayor a 0')
            .required('Campo dirección requerido'),

        PRODUCTO_PRECIO: yup.number()
            .moreThan(0, 'Campo precio debe ser mayor a 0')
            .required('Campo dirección requerido'),

        PRODUCTO_MEDIDA: yup.number()
            .moreThan(0, 'Campo peso debe ser mayor a 0')
            .required('Campo dirección requerido'),

        CATEGORIA_ID: yup.number()
            .moreThan(0, 'Error en el campo categoria')
            .required('Campo dirección requerido'),

        PRESENTACION_ID: yup.number()
            .moreThan(0, 'Error en el campo presentación')
            .required('Campo dirección requerido'),

        MEDIDA_ID: yup.number()
            .moreThan(0, 'Error en el campo unidad de medida')
            .required('Campo dirección requerido'),

    });

    schema.validateSync(data);

    const { OFERTA_DESCRIPCION } = data;

    if (OFERTA_DESCRIPCION.length > 0) {
        if (OFERTA_DESCRIPCION.length < 5) {
            throw new Error('Campo oferta debe tener mínimo 10 caracteres');
        }
    }
    
}

function emailValidation(data) {
    const schema = yup.object().shape({
        email: yup.string()
            .email('Correo electronico inválido')
            .required('Campo email requerido')
    });

    schema.validateSync(data);
}

function passwordValidation(data) {
    const schema = yup.object().shape({
        password1: yup.string()
            .min(5, 'Campo contraseña mínimo 5 caracteres')
            .required('Campo contraseña requerido'),

        password2: yup.string()
            .min(5, 'Campo contraseña mínimo 5 caracteres')
            .required('Campo contraseña requerido'),
    });

    schema.validateSync(data);

    const { password1, password2 } = data;

    if (password1 !== password2) {
        throw new Error('Las contraseñas ingresadas no son identicas');
    }
}

module.exports = {
    validate,
    createUsersValidation,
    loginValidation,
    emailValidation,
    passwordValidation,
    editUsersValidation,
    createProductsValidation,
    editProductsValidation
};