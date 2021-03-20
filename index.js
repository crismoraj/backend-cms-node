'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3999;

mongoose.set('useFindAndModify', false);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_node', { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
        console.log('La conexión a la BD de Mongo se ha realizado con exito!!!');
        //creamos server
        app.listen(port, () => {
            console.log('El sever http://localhost:3999 esta funcionando, ok');
        });
    }).
    catch(error => console.log(error));