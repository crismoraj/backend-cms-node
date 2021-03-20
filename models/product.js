'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//modelo de category
var CategorySchema = Schema({
    content: String,
    date: { type: Date, dafault: Date.now },
    user: { type: Schema.objectId, ref: 'User' }
});

var Category = mongoose.model('Category', CategorySchema);


//modelo de label
var LabelSchema = Schema({
    content: String,
    date: { type: Date, dafault: Date.now },
    user: { type: Schema.objectId, ref: 'User' }
});

var Label = mongoose.model('Label', LabelSchema);

//modelo de producto
var ProductSchema = Schema({
    id: Numeric,
    title: String,
    content: String,
    image: String,
    cost: String,
    discount: String,
    iva: String,
    stock: Number,
    state: String,
    label: [Label],
    prodRelation: String,
    create: { type: Date, dafault: Date.now },
    category: [Category],
    user: { type: Schema.objectId, ref: 'User' }
});

module.exports = mongoose.model('Product', ProductSchema);