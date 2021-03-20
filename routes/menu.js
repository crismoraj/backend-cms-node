'use strict'

//incluimos librerias
var express = require('express');
var menuController = require('../controllers/menu');

var router = express.Router();
var middleware_auth = require('../middlewares/authenticated');

var multiparty = require('connect-multiparty');
var middleware_upload = multiparty({ uploadDir: './uploads/menus' })

//rutas de carpetas
router.post('/registermenu', menuController.saveMenu);
router.put('/updatemenu', middleware_auth.authenticated, menuController.updateMenu);
router.post('/menus', menuController.getMenus);
router.get('/menu/:menuId', menuController.getMenu);

module.exports = router;