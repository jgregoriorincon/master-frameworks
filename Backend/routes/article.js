'use strict'

var express = require('express');
var ArticleController = require('../controllers/article');

var router = express.Router();

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './upload/articles' });

router.post('/save', ArticleController.save);
router.post('/upload-image/:id', md_upload, ArticleController.upload);

router.get('/articles/:last?', ArticleController.getArticles);
router.get('/article/:id', ArticleController.getArticle);
router.get('/get-image/:image', ArticleController.getImage);
router.get('/search/:search', ArticleController.search);

router.put('/article/:id', ArticleController.update);
router.delete('/article/:id', ArticleController.delete);

module.exports = router;