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

    /*
						   mongodb+srv://Bebehmoso6:<password>@cluster0.awdpf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
$ heroku config:set DB_URI=mongodb://<db_user>:<db_password>@ds045715.mlab.com:45715/<db_name>
    */