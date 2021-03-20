'use strict'

var express = require('express');
var BlogController = require('../controllers/blog');

var router = express.Router();
var middleware_auth = require('../middlewares/authenticated');

router.get('/test', BlogController.test);
router.post('/blog', middleware_auth.authenticated, BlogController.save);
router.get('/blogs/:page?', BlogController.getBlogs);
router.get('/user-blogs/:user', BlogController.getBlogsByUser);
router.get('/theme-blogs/:theme', BlogController.getBlogsByTheme);
router.get('/blog/:id', BlogController.getBlog);
router.put('/blog/:id', middleware_auth.authenticated, BlogController.update);
router.delete('/blog/:id', middleware_auth.authenticated, BlogController.delete);
router.get('/search-post/:search', BlogController.search);

module.exports = router;
