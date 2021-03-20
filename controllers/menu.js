'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt');
var fs = require('fs');
var path_node = require('path');
var Menu = require('../models/menu');
var jwt = require('../services/jwt');

function getUrlAmigable(url) {
    url = url.toLowerCase();
    // caracteres especiales latinos
    url = url.replace(/á/gi, 'a');
    url = url.replace(/é/gi, 'e');
    url = url.replace(/í/gi, 'i');
    url = url.replace(/ó/gi, 'o');
    url = url.replace(/ú/gi, 'u');
    url = url.replace(/ñ/gi, 'n');
    url = url.replace(/ |\+|&|\*/gi, '-');

    // Los guiones

    // Reemplazamos demás caracteres especiales por “-”
    /*$find = array('/[^a-z0-9-<>]/', '/[-]+/', '/<[^>]*>/');
    $repl = array('', '-', '');
    $url = preg_replace($find, $repl, $url);*/
    return url;
}

var controller = {
    saveMenu: function (request, response) {
        //recojer los parametros de la peticion
        var params = request.body;
        //validar los datos

        let path_parent = getUrlAmigable(params.parent_route);

        try {
            var message_error = '';

            if (message_error == '') {
                //crear objeto de usuario
                var menu = new Menu();

                //asignar valores a la pagina
                menu.parent = params.parent;
                menu.name = params.name;
                menu.route = getUrlAmigable(params.route);
                menu.parent_route = getUrlAmigable(params.parent_route);
                menu.name_menu = params.name_menu;
                menu.type_menu = params.type_menu;
                menu.type_link = params.type_link;
                //comprobar si el Menú ya existe
                Menu.findOne({ parent: params.parent, name: params.name }, (err, issetMenu) => {
                    if (err) {
                        return response.status(500).send({
                            message: 'Error al comprobar duplicidad de menú',
                            error: err
                        });
                    } else if (!issetMenu) {
                        //Guardamos los datos
                        menu.save((err, menuSaved) => {
                            if (err) {
                                return response.status(500).send({
                                    message: 'Error al guardar el menú',
                                    error: err
                                });
                            }
                            if (!menuSaved) {
                                return response.status(400).send({
                                    message: 'El menú no se ha guardado',
                                    error: err
                                });
                            } else {
                                //devolver respuesta
                                return response.status(200).send({
                                    status: 'success',
                                    message: 'Menú creado',
                                    menu: menuSaved
                                });
                            }
                        });//close saved
                    } else {
                        return response.status(200).send({
                            message: 'Ya existe un elemento con el nombre ' + params.name + ' en este Menú'
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
    getMenu: function (request, response) {
        let menu_id = request.params.menuId;
        Menu.findById(menu_id).exec((error, menu) => {
            if (error || !menu) {
                return response.status('404').send({
                    status: 'error',
                    message: 'No existe el menú'
                });
            } else {
                return response.status(200).send({
                    status: 'success',
                    menu
                });
            }
        });
    },
    getMenus: function (request, response) {

        var params = request.body;
        var nameMenu = params.name_menu;
        var parentRoute = params.parent_route;
        //console.log(idMenu);
        //comprobar si existe el directorio padre
        Menu.findOne({ parent_route: '/' }, (err, issetParent) => {
            //si no existe la ruta padre se crea
            if (!issetParent) {
                //crear objeto de Menu
                var menu = new Menu();
                //asignar valores a la pagina
                menu.parent = '0';
                menu.name = 'Inicio';
                menu.route = '/inicio';
                menu.parent_route = '/';
                menu.name_menu = 'superior';
                menu.type_menu = 'default';
                menu.type_link = '_blank';
                menu.save((err, menuSaved) => {

                });//close saved

            }
            var route_debug = '/inicio';
            //devolver respuesta
            Menu.find({ 'name_menu': nameMenu, 'parent_route': { '$regex': parentRoute } }).exec((error, menus) => {
                if (error || !menus) {
                    return response.status('404').send({
                        status: 'error',
                        message: 'No hay menús para mostrar'
                    });
                } else {
                    if (JSON.stringify(menus) == '[]') {
                        return response.status(200).send({
                            status: 'Se creo el menú padre, intente de nuevo'
                        });
                    } else {
                        return response.status(200).send({
                            status: 'success',
                            menus
                        });
                    }
                }
            });
        });


    },
    updateMenu: function (request, response) {
        //recojer los parametros de la peticion
        var params = request.body;
        var idMenu = params.id;
        //validar los datos
        try {
            let path_parent = getUrlAmigable(params.parent_route);
            params.parent_route = getUrlAmigable(params.parent_route);
            let path_route = getUrlAmigable(params.route);
            params.route = getUrlAmigable(params.route);
            Menu.findOne({ _id: idMenu }, (err, issetMenu) => {
                if (err) {
                    return response.status(500).send({
                        message: 'Error al comprobar existencia de Menú',
                        error: err
                    });
                } else if (!issetMenu) {
                    return response.status(200).send({
                        status: 'error',
                        message: 'No se encontro Menú a actualizar',
                    });
                } else {
                    //consultamos que no exista una carpeta con el mismo nombre en el mismo nivel
                    Menu.findOne({ route: path_route, _id: { $ne: idMenu }, parent: params.parent }, (err, datosDuplicate) => {
                        if (err) {
                            return response.status(500).send({
                                message: 'Error al comprobar duplicidad de Menú',
                                error: err
                            });
                        } else if (!datosDuplicate) {
                            delete params.id;
                            delete params.parent;
                            delete params.parent_route;


                            Menu.findOneAndUpdate({ _id: idMenu }, params, { new: true }, (error, menuUpdated) => {
                                //devolvemos respuesta
                                if (error) {
                                    return response.status(500).send({
                                        message: 'Error al actualizar Menú ' + issetMenu.name,
                                        error: error
                                    });
                                } else if (!menuUpdated) {
                                    return response.status(200).send({
                                        message: 'Error de update',
                                        error: error
                                    });
                                } else {
                                    if (issetMenu.route != params.route) {
                                        //buscamos actualizamos todos los hijos
                                        let route_vieja = issetMenu.route;
                                        // route_vieja = route_vieja.replace(/\//gi, '\/');
                                        Menu.find({ 'route': { '$regex': route_vieja } }).exec((error, menusLoad) => {

                                            if (Object.entries(menusLoad).length === 0) {
                                                return response.status(200).send({
                                                    status: 'success',
                                                    message: 'Menú actualizado sin hijos',
                                                    user: menusLoad
                                                });
                                            } else {
                                                //recorremos los hijos para actuaizar las rutas de los hijos
                                                for (const property in menusLoad) {
                                                    let nuevo_route = menusLoad[property].route.replace(route_vieja, params.route);
                                                    let nuevo_parent_route = menusLoad[property].parent_route.replace(route_vieja, params.route);
                                                    Menu.findOneAndUpdate({ _id: menusLoad[property]._id }, { route: nuevo_route, parent_route: nuevo_parent_route }, { new: true }, (error, menuUpdated) => {

                                                    });
                                                }
                                                return response.status(200).send({
                                                    status: 'success',
                                                    message: 'Menú actualizado con hijos',
                                                    user: menusLoad
                                                });

                                            }

                                        });
                                    } else {
                                        return response.status(200).send({
                                            status: 'success',
                                            message: 'Menú actualizado',
                                            user: menuUpdated
                                        });
                                    }
                                }
                            });


                        } else {
                            return response.status(200).send({
                                status: 'error',
                                message: 'Ya existe un Menú en este nivel con el mismo nombre',
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
    }
}

//exportar controlador
module.exports = controller;