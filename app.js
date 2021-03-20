'use strict'

//incluimos librerias
var express = require('express');
var bodyParser = require('body-parser');

//ejecutar express
var app = express();

//cargar archivos de rutas
var user_routes = require('./routes/user');
var page_routes = require('./routes/page');
var menu_routes = require('./routes/menu');
var blog_routes = require('./routes/blog');
var post_blog_routes = require('./routes/post_blog');

//Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configurar cabeceras y CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


//Reescribir rutas
app.use('/admin', user_routes);
app.use('/admin', page_routes);
app.use('/admin', menu_routes);
app.use('/admin', blog_routes);
app.use('/post', post_blog_routes);


//exportar modulo
module.exports = app;