'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt');
var fs = require('fs');
var path_node = require('path');
var User = require('../models/user');
var jwt = require('../services/jwt');

var controller = {
    probando: function (request, response) {
        return response.status(200).send({
            message: 'Soy el metodo probando'
        });
    },
    testeando: function (request, response) {
        return response.status(200).send({
            message: 'Soy el metodo testeando'
        });
    },
    save: function (request, response) {
        //recojer los parametros de la peticion
        var params = request.body;


        //validar los datos
        try {
            var message_error = '';

            var validate_name = validator.isAlpha(validator.blacklist(params.name, ' '), 'es-ES');
            var validate_name_null = validator.isEmpty(params.name);
            if (!validate_name || validate_name_null) {
                message_error += '<br />- Solo se permiten Letras y espacios en el campo nombre';
            }

            var validate_surmane = validator.isAlpha(validator.blacklist(params.surname, ' '), 'es-ES');
            var validate_surmane_null = validator.isEmpty(params.name);
            if (!validate_surmane || validate_surmane_null) {
                message_error += '<br />- Solo se permiten Letras y espacios en el campo Apellido';
            }

            var validate_email = validator.isEmail(params.email);
            if (!validate_email) {
                message_error += '<br />- Error en el formato de email';
            }
            var validate_password = validator.isAlphanumeric(validator.blacklist(params.password, '!$%&=*-+_><'));
            if (!validate_password) {
                message_error += '<br />- Solo se permiten Letras y numeros en password';
            }

            if (message_error == '') {
                //crear objeto de usuario
                var user = new User();

                //asignar valores al usuario
                user.name = params.name;
                user.surname = params.surname;
                user.email = params.email.toLowerCase();
                user.role = 'ROLE_USER';
                user.image = null;

                //comprobar si el usuario ya existe
                User.findOne({ email: user.email }, (err, issetUser) => {
                    if (err) {
                        return response.status(500).send({
                            message: 'Error al comprobar duplicidad del usuario',
                            error: err
                        });
                    } else if (!issetUser) {
                        const saltRounds = 10;
                        //si no existe cifrar la contraseña
                        bcrypt.hash(params.password, saltRounds, (err, hash) => {
                            user.password = hash;

                            //Guardamos los datos
                            user.save((err, userSaved) => {
                                if (err) {
                                    return response.status(500).send({
                                        message: 'Error al guardar el usuario',
                                        error: err
                                    });
                                }
                                if (!userSaved) {
                                    return response.status(400).send({
                                        message: 'El usuario no se ha guardado',
                                        error: err
                                    });
                                } else {
                                    //devolver respuesta
                                    return response.status(200).send({
                                        status: 'success',
                                        message: 'Usuario creado',
                                        user: userSaved
                                    });
                                }
                            });//close saved
                        });//close decrypt

                    } else {
                        return response.status(200).send({
                            message: 'El usuario ya está registado'
                        });
                    }

                });

            } else {
                return response.status(200).send({
                    message: 'Error de datos',
                    error: message_error
                });
            }
        } catch (error) {
            return response.status(200).send({
                message: 'Faltan datos por enviar',
                error: error
            });
        }

    },
    login: function (request, response) {
        //recojer los parametros de la petición
        var params = request.body;

        //Validar los datos
        try {
            var validate_email = validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);

            if (!validate_email || !validate_password) {
                return response.status(200).send({
                    message: 'Los datos son incorrectos, intenta de nuevo',
                });
            }

            //Validar usuarios que coincidan con el email
            User.findOne({ email: params.email.toLowerCase() }, (err, datosUser) => {
                if (err) {
                    return response.status(500).send({
                        message: 'Error en la busqueda del email, intenta de nuevo',
                        error: err
                    });
                }

                if (!datosUser) {
                    return response.status(404).send({
                        message: 'El usuario no existe'
                    });
                }

                //si se encuentra el usuario se debe comprobar la contraseña para validar coincidencia
                bcrypt.compare(params.password, datosUser.password, (err, result) => {

                    if (err) {
                        return response.status(500).send({
                            message: 'error de login',
                            error: err
                        });
                    }

                    if (!result) {
                        return response.status(404).send({
                            message: 'Las credenciales no son correctas'
                        });
                    }
                    //limpiamos password
                    datosUser.password = undefined;

                    //generar token con JWT
                    if (params.gettoken) {
                        return response.status(200).send({
                            token: jwt.createToken(datosUser)
                        });
                    } else {
                        //devolver respuesta
                        return response.status(200).send({
                            status: 'success',
                            message: 'Usuario encontrado',
                            datosUser
                        });
                    }
                });
            });
        } catch (error) {
            //devolver respuesta
            return response.status(200).send({
                message: 'Faltan datos por enviar',
                error: error
            });
        }
    },
    update: function (request, response) {

        //recojer los datos del usuario
        var params = request.body;
        //validar datos
        //validar los datos


        try {

            var message_error = '';
            var validate_name = validator.isAlpha(validator.blacklist(params.name, ' '), 'es-ES');
            var validate_name_null = validator.isEmpty(params.name);
            if (!validate_name || validate_name_null) {
                message_error += '<br />- Solo se permiten Letras y espacios en el campo nombre';
            }

            var validate_surmane = validator.isAlpha(validator.blacklist(params.surname, ' '), 'es-ES');
            var validate_surmane_null = validator.isEmpty(params.name);
            if (!validate_surmane || validate_surmane_null) {
                message_error += '<br />- Solo se permiten Letras y espacios en el campo Apellido';
            }

            var validate_email = validator.isEmail(params.email);
            if (!validate_email) {
                message_error += '<br />- Error en el formato de email';
            }
            var validate_password = validator.isAlphanumeric(validator.blacklist(params.password, '!$%&=*-+_><'));
            if (!validate_password) {
                message_error += '<br />- Solo se permiten Letras y numeros en password';
            }

            if (message_error == '') {
                //eliminar propiedades innecesarias
                delete params.password;
                delete params.role;

                var userId = request.user.sub;
                //comprobamos si el email es unico
                User.findOne({ email: params.email.toLowerCase(), _id: { $ne: userId } }, (err, datosUser) => {
                    if (err) {
                        return response.status(500).send({
                            message: 'Error en la busqueda del email, intenta de nuevo'
                        });
                    } else if (datosUser && datosUser.email == params.email) {
                        return response.status(500).send({
                            message: 'El email no puede ser modificado, ya esta registrado el mail ' + datosUser.email
                        });
                    } else {
                        User.findOneAndUpdate({ _id: userId }, params, { new: true }, (error, userUpdated) => {
                            //devolvemos respuesta
                            if (error) {
                                return response.status(500).send({
                                    message: 'Error al actualizar datos',
                                    error: error
                                });
                            } else if (!userUpdated) {
                                return response.status(200).send({
                                    message: 'Error de update',
                                    error: error
                                });
                            } else {
                                return response.status(200).send({
                                    status: 'success',
                                    message: 'Usuario actualizado',
                                    user: userUpdated
                                });
                            }
                        });
                    }
                });

            } else {
                return response.status(200).send({
                    message: 'Error de validación de datos',
                    error: message_error
                });
            }
        } catch (error) {
            return response.status(200).send({
                message: 'Faltan datos por enviar',
                error: error
            });
        }



    },
    uploadAvatar: function (request, response) {
        //configurar el modulo multiparty para habiliar la subida de ficheros 
        //listo: (routes/user.js)
        //recojer el fichero de la peticion
        let file_name = 'Avatar no subido...';
        if (!request.files) {
            //devolver respuesta
            return response.status(404).send({
                status: 'error',
                message: file_name
            });

        }
        //console.log(request.files);
        //conseguir le nombre y la extension del archivo subido
        let file_path = request.files.null.path;
        let file_split = request.files.null.name.split('.');
        file_name = request.files.null.name;
        //comprobar la extension (solo img)
        if (file_split[file_split.length - 1] == 'JPG' || file_split[file_split.length - 1] == 'jpg' || file_split[file_split.length - 1] == 'JPEG' || file_split[file_split.length - 1] == 'jpeg' || file_split[file_split.length - 1] == 'PNG' || file_split[file_split.length - 1] == 'png' || file_split[file_split.length - 1] == 'gif' || file_split[file_split.length - 1] == 'GIF') {
            //validmos tamaño de archivo
            let file_size = ((request.files.null.size) / 1024) / 1024;
            let multiplier = Math.pow(10, 1 || 0);
            file_size = Math.round(file_size * multiplier) / multiplier;

            if (file_size > '2') {
                fs.unlink(file_path, (error) => {
                    if (error) {
                        return response.status(404).send({
                            status: 'error',
                            message: 'Error en borrado de archivo',
                            error: error
                        });
                    } else {
                        return response.status(200).send({
                            status: 'error',
                            message: 'Tamaño de imagen excedida (' + file_size + 'Mb), tamaño maximo (5Mb)'
                        });
                    }
                });
            } else {

                //sacar el id del usuario identificado
                //recojer los datos del usuario
                //let params = request.user;
                //console.log(params);
                let userId = request.user.sub;
                //hacer el search and update de la imgen en el usuario en BD
                User.findOneAndUpdate({ _id: userId }, { image: file_name }, { new: true }, (error, userUpdated) => {
                    //devolvemos respuesta
                    if (error) {
                        return response.status(500).send({
                            message: 'Error al actualizar datos',
                            error: error
                        });
                    } else if (!userUpdated) {
                        return response.status(200).send({
                            message: 'Error de update',
                            error: error
                        });
                    } else {
                        //devolver respuesta
                        return response.status(200).send({
                            status: 'success',
                            message: file_path,
                            file: file_name,
                            user: userUpdated
                        });
                    }
                });

            }
        } else {
            fs.unlink(file_path, (error) => {
                if (error) {
                    return response.status(404).send({
                        status: 'error',
                        message: 'Error en borrado de archivo',
                        error: error
                    });
                } else {
                    return response.status(404).send({
                        status: 'error',
                        message: 'Extensión invalida'
                    });
                }
            });
        }
    },
    avatar: function (request, response) {
        let file_name = request.params.fileName;
        let path_file = './uploads/users/' + file_name;

        fs.exists(path_file, (exist) => {
            if (exist) {
                return response.sendFile(path_node.resolve(path_file));
            } else {
                return response.status('404').send({
                    message: 'La imagen no existe'
                });
            }
        });
    },
    getUsers: function (request, response) {
        User.find().exec((error, users) => {
            if (error || !users) {
                return response.status('404').send({
                    status: 'error',
                    message: 'No hay usuarios para mostrar'
                });
            } else {
                return response.status(200).send({
                    status: 'success',
                    users
                });
            }
        });
    },
    getUser: function (request, response) {
        let user_id = request.params.userId;
        User.findById(user_id).exec((error, user) => {
            if (error || !user) {
                return response.status('404').send({
                    status: 'error',
                    message: 'No existe el usuario'
                });
            } else {
                return response.status(200).send({
                    status: 'success',
                    user
                });
            }
        });
    }
};

//exportar controlador
module.exports = controller;