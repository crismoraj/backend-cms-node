'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PageSchema = Schema({
    parent: String,
    name: String,
    route: String,
    parent_route: String,
    head: String, //style & scripts
    content: String, //HTML
    foot: String, //style & scripts
    look: String
});

module.exports = mongoose.model('Page', PageSchema);

/* SE LLAMA ESTE MODELO PARA CARGAR CONTENIDOS SE PAGINA, en el content, solo va HTML (formularios, imagenes, .... y todo tipo de contenido HTML) */