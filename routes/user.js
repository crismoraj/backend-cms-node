'use strict'

//incluimos librerias
var express = require('express');
var userController = require('../controllers/user');

var router = express.Router();
var middleware_auth = require('../middlewares/authenticated');

var multiparty = require('connect-multiparty');
var middleware_upload = multiparty({ uploadDir: './uploads/users' })


//rutas de pruebas
router.get('/probando', userController.probando);
router.post('/testeando', userController.testeando);

//rutas de usuarios
router.post('/register', userController.save);
router.post('/login', userController.login);
router.put('/update', middleware_auth.authenticated, userController.update);
router.post('/upload-avatar', [middleware_auth.authenticated, middleware_upload], userController.uploadAvatar);
router.get('/avatar/:fileName', userController.avatar);
router.get('/users', userController.getUsers);
router.get('/user/:userId', userController.getUser);

module.exports = router;
