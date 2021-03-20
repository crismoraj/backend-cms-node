'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

const secret = 'clave-secreta-mimamamemima';

exports.authenticated = function (request, response, next) {

    //comprobar si llega cabecera de autorizacon
    if (!request.headers.authorization) {
        return response.status(403).send({
            message: 'No existe cabecera de autenticación'
        });
    }

    //limpiar el token y quitar comillas
    var token = request.headers.authorization.replace(/['"]+/g, '');

    try {
        //decodificar el token
        var payload = jwt.decode(token, secret);

        //compreobar si el token a expirado
        if (payload.exp <= moment().unix()) {
            return response.status(403).send({
                message: 'El token ha expirado'
            });
        }

    } catch (exep) {
        return response.status(403).send({
            message: 'El token no es valido'
        });
    }

    //adjuntar usuario identificado a la request
    request.user = payload;

    //pasar a la acción
    next();
}