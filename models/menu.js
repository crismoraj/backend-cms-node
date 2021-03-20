'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MenuSchema = Schema({
    parent: String, // id pagina pertenece (ejemplo: id de la pagina Inicio donde se van a relacionar los diferentes carpetas de menu)
    parent_route: String, // id pagina pertenece (ejemplo: id de la pagina Inicio donde se van a relacionar los diferentes carpetas de menu)
    name: String, // contactenos
    route: String,  // /inicio/contactenos
    name_menu: String, // superior / superior2 / lateral / contenido / pata
    type_menu: String, // desplegable / default / contenido...
    type_link: String // _blank / self / ...
});

module.exports = mongoose.model('Menu', MenuSchema);

/* SE LLAMA ESTE MODELO PARA CARGAR CONTENIDOS SE PAGINA, en el content, solo va HTML (formularios, imagenes, .... y todo tipo de contenido HTML) */