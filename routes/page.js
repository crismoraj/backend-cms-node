'use strict'

//incluimos librerias
var express = require('express');
var pageController = require('../controllers/page');

var router = express.Router();
var middleware_auth = require('../middlewares/authenticated');

var multiparty = require('connect-multiparty');
var middleware_upload = multiparty({ uploadDir: './uploads/pages' })

//rutas de carpetas
router.post('/registerpage', pageController.savePage);
router.put('/updatepage', middleware_auth.authenticated, pageController.updatePage);
router.get('/pages', pageController.getPages);
router.get('/page/:pageId', pageController.getPage);
router.post('/pageload', pageController.loadPage);

module.exports = router;