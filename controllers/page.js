'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt');
var fs = require('fs');
var path_node = require('path');
var Page = require('../models/page');
var jwt = require('../services/jwt');

function getUrlAmigable(url) {
    url = url.toLowerCase();
    // caracteres especiales latinos
    url = url.replace(/Ã¡/gi, 'a');
    url = url.replace(/Ã©/gi, 'e');
    url = url.replace(/Ã­/gi, 'i');
    url = url.replace(/Ã³/gi, 'o');
    url = url.replace(/Ãº/gi, 'u');
    url = url.replace(/Ã±/gi, 'n');
    url = url.replace(/ |\+|&|\*/gi, '-');

    // Los guiones

    // Reemplazamos demÃ¡s caracteres especiales por â-â
    /*$find = array('/[^a-z0-9-<>]/', '/[-]+/', '/<[^>]*>/');
    $repl = array('', '-', '');
    $url = preg_replace($find, $repl, $url);*/
    return url;
}

var controller = {
    savePage: function (request, response) {
        //recojer los parametros de la peticion
        var params = request.body;
        //validar los datos

        let path_parent = getUrlAmigable(params.parent_route);

        try {
            var message_error = '';

            if (message_error == '') {
                //crear objeto de usuario
                var page = new Page();

                //asignar valores a la pagina
                page.parent = params.parent;
                page.name = params.name;
                page.route = getUrlAmigable(params.route);
                page.parent_route = getUrlAmigable(params.parent_route);
                page.head = params.head;
                page.content = params.content;
                page.foot = params.foot;
                page.look = params.look;

                //comprobar si el directorio ya existe
                Page.findOne({ parent: params.parent, name: params.name }, (err, issetPage) => {
                    if (err) {
                        return response.status(500).send({
                            message: 'Error al comprobar duplicidad de directorio',
                            error: err
                        });
                    } else if (!issetPage) {
                        //Guardamos los datos
                        page.save((err, pageSaved) => {
                            if (err) {
                                return response.status(500).send({
                                    message: 'Error al guardar el directorio',
                                    error: err
                                });
                            }
                            if (!pageSaved) {
                                return response.status(400).send({
                                    message: 'El directorio no se ha guardado',
                                    error: err
                                });
                            } else {
                                //devolver respuesta
                                return response.status(200).send({
                                    status: 'success',
                                    message: 'Directorio creado',
                                    page: pageSaved
                                });
                            }
                        });//close saved
                    } else {
                        return response.status(200).send({
                            message: 'Ya existe un elemento con el nombre ' + params.name + ' en este directorio'
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
    getPage: function (request, response) {
        let page_id = request.params.pageId;
        Page.findById(page_id).exec((error, page) => {
            if (error || !page) {
                return response.status('404').send({
                    status: 'error',
                    message: 'No existe el directorio'
                });
            } else {
                return response.status(200).send({
                    status: 'success',
                    page
                });
            }
        });
    },
    getPages: function (request, response) {

        //comprobar si existe el directorio padre
        Page.findOne({ parent_route: '/' }, (err, issetParent) => {
            //si no existe la ruta padre se crea
            if (!issetParent) {
                //crear objeto de Page
                var page = new Page();
                //asignar valores a la pagina
                page.parent = '0';
                page.name = 'Inicio';
                page.route = '/inicio';
                page.parent_route = '/';
                page.head = '';
                page.content = '';
                page.foot = '';
                page.look = 'simple';
                page.save((err, pageSaved) => {

                });//close saved

            }

            //devolver respuesta
            Page.find().exec((error, pages) => {
                if (error || !pages) {
                    return response.status('404').send({
                        status: 'error',
                        message: 'No hay directorios para mostrar'
                    });
                } else {
                    if (JSON.stringify(pages) == '[]') {
                        return response.status(200).send({
                            status: 'Se creo el directorio padre, intente de nuevo',
                            pages
                        });
                    } else {
                        return response.status(200).send({
                            status: 'success',
                            pages
                        });
                    }
                }
            });
        });


    },
    loadPage: function (request, response) {

        var params = request.body;
        var urlPage = params.route;
        //console.log(idMenu);
        //comprobar si existe el directorio padre

        Page.find({ 'route': urlPage }).exec((error, pageLoad) => {
            if (error || !pageLoad) {
                return response.status('404').send({
                    status: 'error',
                    message: 'No hay contenido para mostrar'
                });
            } else {

                return response.status(200).send({
                    status: 'success',
                    pageLoad
                });

            }
        });

    },
    updatePage: function (request, response) {
        //recojer los parametros de la peticion
        var params = request.body;
        var idPage = params.id;
        //validar los datos
        try {
            let path_parent = getUrlAmigable(params.parent_route);
            params.parent_route = getUrlAmigable(params.parent_route);
            let path_route = getUrlAmigable(params.route);
            params.route = getUrlAmigable(params.route);
            Page.findOne({ _id: idPage }, (err, issetPage) => {
                if (err) {
                    return response.status(500).send({
                        message: 'Error al comprobar existencia de directorio',
                        error: err
                    });
                } else if (!issetPage) {
                    return response.status(200).send({
                        status: 'error',
                        message: 'No se encontro directorio a actualizar',
                    });
                } else {
                    //consultamos que no exista una carpeta con el mismo nombre en el mismo nivel
                    Page.findOne({ route: path_route, _id: { $ne: idPage }, parent: params.parent }, (err, datosDuplicate) => {
                        if (err) {
                            return response.status(500).send({
                                message: 'Error al comprobar duplicidad de directorio',
                                error: err
                            });
                        } else if (!datosDuplicate) {
                            delete params.id;
                            delete params.parent;
                            delete params.parent_route;


                            Page.findOneAndUpdate({ _id: idPage }, params, { new: true }, (error, pageUpdated) => {
                                //devolvemos respuesta
                                if (error) {
                                    return response.status(500).send({
                                        message: 'Error al actualizar directorio ' + issetPage.name,
                                        error: error
                                    });
                                } else if (!pageUpdated) {
                                    return response.status(200).send({
                                        message: 'Error de update',
                                        error: error
                                    });
                                } else {
                                    if (issetPage.route != params.route) {
                                        //buscamos actualizamos todos los hijos
                                        let route_vieja = issetPage.route;
                                        // route_vieja = route_vieja.replace(/\//gi, '\/');
                                        Page.find({ 'route': { '$regex': route_vieja } }).exec((error, pagesLoad) => {

                                            if (Object.entries(pagesLoad).length === 0) {
                                                return response.status(200).send({
                                                    status: 'success',
                                                    message: 'Directorio actualizado sin hijos',
                                                    user: pagesLoad
                                                });
                                            } else {
                                                //recorremos los hijos para actuaizar las rutas de los hijos
                                                for (const property in pagesLoad) {
                                                    let nuevo_route = pagesLoad[property].route.replace(route_vieja, params.route);
                                                    let nuevo_parent_route = pagesLoad[property].parent_route.replace(route_vieja, params.route);
                                                    Page.findOneAndUpdate({ _id: pagesLoad[property]._id }, { route: nuevo_route, parent_route: nuevo_parent_route }, { new: true }, (error, pageUpdated) => {

                                                    });
                                                }
                                                return response.status(200).send({
                                                    status: 'success',
                                                    message: 'Directorio actualizado con hijos',
                                                    user: pagesLoad
                                                });

                                            }

                                        });
                                    } else {
                                        return response.status(200).send({
                                            status: 'success',
                                            message: 'Directorio actualizado',
                                            user: pageUpdated
                                        });
                                    }
                                }
                            });


                        } else {
                            return response.status(200).send({
                                status: 'error',
                                message: 'Ya existe un directorio en este nivel con el mismo nombre',
                                datosDuplicate
                            });
                        }
                    });
                }
            });


        } catch (error) {
            return response.status(200).send({
                message: 'Faltan datos por enviar',
                error: error
            });
        }



        /*
        var PageSchema = Schema({
        parent: String,
        name: String,
        route: String,
        parent_route: String,
        head: String, //style & scripts
        content: String, //HTML
        foot: String, //style & scripts
        look: String
        */
    }
}

//exportar controlador
module.exports = controller;