'use strict'

var express = require('express');
var Post_blogController = require('../controllers/post_blog');

var router = express.Router();
var middleware_auth = require('../middlewares/authenticated');

router.post('/post_blog/blog/:blogId', middleware_auth.authenticated, Post_blogController.add);
router.put('/post_blog/:postId', middleware_auth.authenticated, Post_blogController.update);
router.delete('/post_blog/:blogId/:postId', middleware_auth.authenticated, Post_blogController.delete);

module.exports = router;