'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idUniqueValidate = 'formulari0-unico-p0st';

var FormSchema = Schema({
    route: String,
    parent_route: String,
    id: String,
    idUnique: String, //validamos que el idUniqueValidate sea el mismo de lado y lado generado en md5 mkTime+idUniqueValidate
    fields: String, /*{ nombres: 'Carlos', Apellidos: 'Sanchez', email: 'carloss@gmail.com' }*/
    date: { type: Date, dafault: Date.now },
    mkTime: Number // time para validar llave
});

module.exports = mongoose.model('Form', FormSchema);

/* SOLAMNETE DE LLAMA ESTE MODELO CUANDO SE VA A GUARDAR UN POST */