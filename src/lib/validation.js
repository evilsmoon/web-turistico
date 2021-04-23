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

function createUsersValidation(data) {
    const schema = yup.object().shape({
        PERSONA_NOMBRE: yup.string()
            .min(10, 'Campo nombre mínimo 10 caracteres')
            .matches(/^[a-zA-Z ]+$/, 'Campo nombre solo debe de tener letras')
            .required('Campo nombre requerido'),

        PERSONA_TELEFONO: yup.string()
            .min(8, 'Campo telefono mínimo 8 caracteres')
            .matches(/^[0-9]+$/, 'Campo telefono solo debe de tener números')
            .required('Campo telefono requerido'),

        PERSONA_EMAIL: yup.string()
            .email('Correo electronico inválido')
            .required('Campo email requerido'),

        PERSONA_CONTRASENA: yup.string()
            .min(8, 'Campo contraseña mínimo 8 caracteres')
            .required('Campo contraseña requerido'),
    });

    schema.validateSync(data);

    const { DIRECCION_ID } = data;

    if (Number(DIRECCION_ID) <= 0) {
        throw new Error('Error en el campo dirección');
    }
}

function editUsersValidation(data) {
    const schema = yup.object().shape({
        PERSONA_NOMBRE: yup.string()
            .min(10, 'Campo nombre mínimo 10 caracteres')
            .matches(/^[a-zA-Z ]+$/, 'Campo nombre solo debe de tener letras')
            .required('Campo nombre requerido'),

        PERSONA_TELEFONO: yup.string()
            .min(8, 'Campo telefono mínimo 8 caracteres')
            .matches(/^[0-9]+$/, 'Campo telefono solo debe de tener números')
            .required('Campo telefono requerido'),

    });

    schema.validateSync(data);

}

function createProductsValidation(data) {
    const schema = yup.object().shape({
        PRODUCTO_NOMBRE: yup.string()
            .min(3, 'Campo nombre mínimo 3 caracteres')
            .matches(/^[a-zA-Z ]+$/, 'Campo nombre solo debe de tener letras')
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
    });

    schema.validateSync(data);

    const { CATEGORIA_ID, PRESENTACION_ID, MEDIDA_ID } = data;

    if (Number(CATEGORIA_ID) <= 0) {
        throw new Error('Error en el campo categoria');
    }

    if (Number(PRESENTACION_ID) <= 0) {
        throw new Error('Error en el campo presentación');
    }

    if (Number(MEDIDA_ID) <= 0) {
        throw new Error('Error en el campo unidad de medida');
    }

}

function editProductsValidation(data) {
    const schema = yup.object().shape({
        PRODUCTO_NOMBRE: yup.string()
            .min(4, 'Campo nombre mínimo 4 caracteres')
            .matches(/^[a-zA-Z ]+$/, 'Campo nombre solo debe de tener letras')
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
            
    });

    schema.validateSync(data);

    const { CATEGORIA_ID, PRESENTACION_ID, MEDIDA_ID } = data;

    if (Number(CATEGORIA_ID) <= 0) {
        throw new Error('Error en el campo categoria');
    }

    if (Number(PRESENTACION_ID) <= 0) {
        throw new Error('Error en el campo presentación');
    }

    if (Number(MEDIDA_ID) <= 0) {
        throw new Error('Error en el campo unidad de medida');
    }

}

module.exports = {
    validate,
    createUsersValidation,
    editUsersValidation,
    createProductsValidation,
    editProductsValidation
};