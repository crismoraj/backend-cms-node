'use strict'

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var Schema = mongoose.Schema;

//modelo de comment
var CommentSchema = Schema({
    content: String,
    date: { type: Date, default: Date.now },
    user: { type: Schema.ObjectId, ref: 'User' }
});

var Comment = mongoose.model('Comment', CommentSchema);

//modelo de blog
var BlogSchema = Schema({
    title: String,
    content: String,
    theme: String,
    sub_theme: String,
    route: String,
    date: { type: Date, default: Date.now },
    user: { type: Schema.ObjectId, ref: 'User' },
    comments: [CommentSchema]

});

//cargar paginación
BlogSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Blog', BlogSchema);