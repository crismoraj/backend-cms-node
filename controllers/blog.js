'use strict'

var validator = require('validator');
//const { findOneAndDelete } = require('../models/blog');
var Blog = require('../models/blog');

var controller = {
    test: function (request, response) {
        return response.status(200).send({
            message: 'Holirijillo mundirijillo'
        });
    },
    save: function (request, response) {

        //recoger parametros
        let params = request.body;

        try {
            //validar datos
            let validate_title = !validator.isEmpty(params.title);
            let validate_content = !validator.isEmpty(params.content);
            let validate_theme = !validator.isEmpty(params.theme);
            let validate_route = !validator.isEmpty(params.route);

            if (validate_title && validate_content && validate_theme && validate_route) {

                //crear objeto a gardar
                let blog = new Blog();

                //asignar valores
                blog.title = params.title;
                blog.content = params.content;
                blog.theme = params.theme;
                blog.sub_theme = params.sub_theme;
                blog.route = params.route;
                blog.user = request.user.sub;

                //guardar blog
                blog.save((error, blogStore) => {

                    if (error || !blogStore) {
                        //devolver respuesta
                        return response.status(400).send({
                            status: 'error',
                            message: 'No se ha guardado el blog',
                            error: error
                        });
                    } else {
                        //devolver respuesta
                        return response.status(200).send({
                            status: 'success',
                            message: 'Se ha guardado el blog',
                            blog: blogStore
                        });
                    }
                });

            } else {
                return response.status(200).send({
                    status: 'error',
                    message: 'Los datos no son validos'
                });
            }

        } catch (error) {
            return response.status(500).send({
                status: 'error',
                message: 'Error en envio de request, faltan datos por enviar',
                error: error
            });
        }
    },
    getBlogs: function (request, response) {

        //cargar la libreria de la paginacion en la clase (MODELO)

        //recoger la pagina actual
        request.params.page = parseInt(request.params.page);
        if (request.params.page == null || request.params.page == undefined || !request.params.page || request.params.page == 0) {
            request.params.page = 1;
        }
        let page = request.params.page;

        //indicar las opciones de paginación
        let options = {
            sort: { date: -1 },
            populate: 'user',
            limit: 5,
            page: page
        };

        //buscar paginado
        Blog.paginate({}, options, (error, blogs) => {

            if (error) {
                return response.status(500).send({
                    status: 'error',
                    message: 'Error al realizar la consulta',
                    error: error
                });
            } else if (!blogs) {
                return response.status(200).send({
                    status: 'success',
                    message: 'No hay resultados para mostrar'
                });
            } else {
                //devolver resultado(blogs, total de blogs, total de pag)
                return response.status(200).send({
                    status: 'success',
                    message: 'Resultado blogs',
                    blogs: blogs.docs,
                    totalDocs: blogs.totalDocs,
                    totalPages: blogs.totalPages
                });
            }

        });


    },
    getBlogsByUser: function (request, response) {

        //conseguir id de usuario
        let userId = request.params.user;

        //find con condicion de usuario
        Blog.find({
            user: userId
        })
            .sort([['date', 'descending']])
            .exec((error, blogs) => {
                if (error) {
                    return response.status(500).send({
                        status: 'error',
                        message: 'Error al realizar la consulta',
                        error: error
                    });
                } else if (!blogs) {
                    return response.status(200).send({
                        status: 'success',
                        message: 'No hay resultados para mostrar'
                    });
                } else {
                    //devolver resultado(blogs, total de blogs, total de pag)
                    return response.status(200).send({
                        status: 'success',
                        message: 'Resultado blogs',
                        blogs
                    });
                }
            });


    },
    getBlogsByTheme: function (request, response) {

        //conseguir id de tema
        let theme = request.params.theme;

        //find con condicion de tema
        Blog.find({
            theme: theme
        })
            .sort([['date', 'descending']])
            .exec((error, blogs) => {
                if (error) {
                    return response.status(500).send({
                        status: 'error',
                        message: 'Error al realizar la consulta',
                        error: error
                    });
                } else if (!blogs) {
                    return response.status(200).send({
                        status: 'success',
                        message: 'No hay resultados para mostrar'
                    });
                } else {
                    //devolver resultado(blogs, total de blogs, total de pag)
                    return response.status(200).send({
                        status: 'success',
                        message: 'Resultado blogs',
                        blogs
                    });
                }
            });


    }, getBlog: function (request, response) {
        //conseguir id de BLOG
        let idBlog = request.params.id;
        //find con condicion de BLOG
        Blog.findById(idBlog)
            .populate('user')
            .exec((error, blogs) => {
                if (error) {
                    return response.status(500).send({
                        status: 'error',
                        message: 'Error al realizar la consulta',
                        error: error
                    });
                } else if (!blogs) {
                    return response.status(200).send({
                        status: 'success',
                        message: 'No hay resultados para mostrar'
                    });
                } else {
                    //devolver resultado(blogs, total de blogs, total de pag)
                    return response.status(200).send({
                        status: 'success',
                        message: 'Resultado blogs',
                        blogs
                    });
                }
            });
    },
    update: function (request, response) {
        //recoger id del blog
        let blogId = request.params.id;

        //recoger los datos que llegan del post
        let params = request.body;

        //validar datos
        try {
            //validar datos
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_theme = !validator.isEmpty(params.theme);
            var validate_route = !validator.isEmpty(params.route);

        } catch (error) {
            return response.status(500).send({
                status: 'error',
                message: 'Error en envio de request, faltan datos por enviar',
                error: error
            });
        }

        if (validate_title && validate_content && validate_theme && validate_route) {

            //Montar una json con los datos modificables
            let update = {
                title: params.title,
                content: params.content,
                theme: params.theme,
                route: params.route
            };

            //find and update del id y que seamos dueños del blog
            Blog.findOneAndUpdate({ _id: blogId, user: request.user.sub }, update, { new: true }, (error, blogUpdate) => {
                if (error) {
                    return response.status(500).send({
                        status: 'error',
                        message: 'Error en petición'
                    });
                } else if (!blogUpdate) {
                    return response.status(404).send({
                        status: 'error',
                        message: 'Error de update'
                    });
                } else {
                    //devolver respuesta
                    return response.status(200).send({
                        status: 'success',
                        message: 'Blog Actualizado',
                        blog: blogUpdate
                    });
                }
            });


        } else {
            return response.status(200).send({
                status: 'error',
                message: 'La validacion de los datos no es correcta'
            });
        }
    },
    delete: function (request, response) {
        //sacar el id del blog de la URL
        let blogId = request.params.id;

        //find and delete por id de blog y usuario
        Blog.findOneAndDelete({ _id: blogId, user: request.user.sub }, (error, blogDelete) => {
            //devolver respueesta
            if (error) {
                return response.status(500).send({
                    status: 'error',
                    message: 'Error en petición'
                });
            } else if (!blogDelete) {
                return response.status(404).send({
                    status: 'error',
                    message: 'Error de delete'
                });
            } else {
                return response.status(200).send({
                    status: 'success',
                    message: 'Borrado de blog',
                    blog: blogDelete
                });
            }
        });

    }, search: function (request, response) {

        //sacar string a buscar de la URL
        let searchString = request.params.search;

        //find con operador OR
        Blog.find({
            "$or": [
                { "title": { "$regex": searchString, "$options": "i" } },
                { "content": { "$regex": searchString, "$options": "i" } },
                { "theme": { "$regex": searchString, "$options": "i" } },
                { "sub_theme": { "$regex": searchString, "$options": "i" } }
            ]
        })
            .sort([['date', 'descending']])
            .exec((error, posts) => {

                //devolver busqueda
                if (error) {
                    return response.status(500).send({
                        status: 'error',
                        message: 'Error en petición'
                    });
                } else if (!posts) {
                    return response.status(404).send({
                        status: 'error',
                        message: 'Error de busqueda'
                    });
                } else {
                    return response.status(200).send({
                        status: 'success',
                        message: 'Post encontrado',
                        posts: posts
                    });
                }
            });


    }
};

module.exports = controller;