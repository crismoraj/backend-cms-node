'use strict'

var validator = require('validator');
var Blog = require('../models/blog');

var controller = {
    add: function (request, response) {
        //recoger el id del blog de la url
        var blogId = request.params.blogId;

        //encontrar el id del blog en la BD
        Blog.findById(blogId).exec((err, blog) => {

            if (err) {
                return response.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            } else if (!blog) {
                return response.status(404).send({
                    status: 'error',
                    message: 'No existe el blog'
                });
            } else {
                if (request.body.content) {
                    //validar datos
                    try {
                        //validar datos
                        var validate_content = !validator.isEmpty(request.body.content);

                    } catch (error) {
                        return response.status(500).send({
                            status: 'error',
                            message: 'No has comentado nada!!!',
                            error: error
                        });
                    }

                    if (validate_content) {

                        let comment = {
                            user: request.user.sub,
                            content: request.body.content
                        };

                        //En la propiedad commnets de ls BD del Blog hacer un push(añadimos el objeto)
                        blog.comments.push(comment);

                        //guardar el post en el blog
                        blog.save((error) => {
                            //devolvemos respuesta
                            if (error) {
                                return response.status(500).send({
                                    status: 'error',
                                    message: 'Error al guardar',
                                    error: error
                                });
                            } else {
                                return response.status(200).send({
                                    status: 'success',
                                    message: 'Se ha agregado el comentario'
                                });
                            }
                        });
                    } else {
                        return response.status(500).send({
                            status: 'error',
                            message: 'No se han validado los datos del comentario'
                        });
                    }
                }
            }
        });

    },
    update: function (request, response) {
        //conseguir el id del contario por URL
        var commentId = request.params.postId;

        //recoger datos que llegan por body y validar
        var params = request.body;
        try {
            //validar datos
            var validate_content = !validator.isEmpty(params.content);

        } catch (error) {
            return response.status(500).send({
                status: 'error',
                message: 'No has comentado nada!!!',
                error: error
            });
        }

        if (validate_content) {
            //find and update del subdocumento
            Blog.findOneAndUpdate(
                { "comments._id": commentId },
                {
                    "$set": {
                        "comments.$.content": params.content
                    }
                },
                { new: true },
                (error, comentUpdate) => {
                    //devolver los datos
                    if (error) {
                        return response.status(500).send({
                            status: 'error',
                            message: 'Error en la petición'
                        });
                    } else if (!comentUpdate) {
                        return response.status(404).send({
                            status: 'error',
                            message: 'No existe el comentario'
                        });
                    } else {
                        return response.status(200).send({
                            status: "success",
                            message: 'Se actualizo comentario',
                            post_blog: comentUpdate
                        });
                    }
                }
            );

        }


    },
    delete: function (request, response) {

        //sacar el id del topic y del comentario a borrar por URL
        var blogId = request.params.blogId
        var commentId = request.params.postId;

        //buscar el topic
        Blog.findById(blogId, (error, blogFound) => {
            if (error) {
                return response.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            } else if (!blogFound) {
                return response.status(404).send({
                    status: 'error',
                    message: 'No existe el comentario'
                });
            } else {
                //Selecccionar el subdocumento (comentario post)
                var comment = blogFound.comments.id(commentId);

                //Borrar el comentario
                if (comment) {
                    comment.remove();

                    //guardar el post
                    blogFound.save((err) => {
                        //devolvemos respuesta
                        if (error) {
                            return response.status(500).send({
                                status: 'error',
                                message: 'Error al guardar',
                                error: error
                            });
                        } else {
                            return response.status(200).send({
                                status: 'success',
                                message: 'Se ha borrado el comentario',
                                blogFound
                            });
                        }
                    });

                } else {
                    return response.status(404).send({
                        status: 'error',
                        message: 'No existe el comentario'
                    });
                }

            }
        });
    }
};

module.exports = controller;