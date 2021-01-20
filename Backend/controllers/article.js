'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');

var Article = require('../models/article');

var controller = {

    save: (req, res) => {
        // recoger los parametros por POST
        var params = req.body;

        // Validar datos (validator)
        try {
            var validateTitle = !validator.isEmpty(params.title);
            var validateContent = !validator.isEmpty(params.content);
        } catch (error) {
            return res.status(200).send({
                status: 'error',
                message: 'faltan datos por enviar'
            });
        }

        if (validateTitle && validateContent){
            // Crear el objeto a guardar
            var article = new Article();

            // Asignar valores
            article.title = params.title;
            article.content = params.content;
            article.image = null;

            // Guardar el articulo
            article.save((err, articleStored) => {
                if (err || !articleStored) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El artículo no se ha podido guardar'
                    });
                }

                // Devolver una respuesta
                return res.status(200).send({
                    article: articleStored
                });
            });

        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos no son validos'
            });
        }
    },

    getArticles: (req, res) => {
        var query = Article.find({});

        var last = req.params.last;
        if (last || last != undefined) {
            query.limit(5);
        }
        
        query.sort('-_id').exec((err, articles) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los artículos !!'
                });
            }

            if (!articles) {
                return res.status(404).send({
                    status: "error",
                    message: "No existen artículos"
                });
            } else {
                return res.status(200).send({
                    articles
                });
            }

        });
    },

    getArticle: (req, res) => {

        // Recoger el id de la URL
        var articleId = req.params.id;

        // Comprobar que existe
        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: "error",
                message: "No existen el artículo"
            });
        }

        // Buscar el articulo
        Article.findById(articleId, (err, article) => {

            if (err || !article) {
                return res.status(404).send({
                    status: "error",
                    message: "No existen artículos"
                });
            } else {
                return res.status(200).send({
                    status: 'success',
                    article
                });
            }

        });
    },

    update: (req, res) => {
        // recoger el id del articulo por la URL
        var articleId = req.params.id;

        // Recoger los datos que llegan por PUT
        var params = req.body;

        // Validar datos
        try {
            var validateTitle = !validator.isEmpty(params.title);
            var validateContent = !validator.isEmpty(params.content);
        } catch (error) {
            return res.status(200).send({
                status: "error",
                message: "Faltan datos por enviar !!!"
            });
        }

        if (validateTitle && validateContent) {
            // Find and Update
            Article.findOneAndUpdate({_id: articleId}, params, {new: true}, (err, articleUpdate) => {
                if (err || !articleUpdate) {
                    return res.status(500).send({
                        status: "error",
                        message: "Error al actualizar"
                    });
                } 

                return res.status(200).send({
                    status: "success",
                    articleUpdate
                });

            });
        } else {
            return res.status(200).send({
                status: "error",
                message: "la validación no es correcta"
            });
        }
    },

    delete: (req, res) => {
        // recoger el id del articulo por la URL
        var articleId = req.params.id;

        // Find and Delete
        Article.findOneAndDelete({_id: articleId}, (err, articleDelete) => {
            if (err) {
                return res.status(500).send({
                    status: "error",
                    message: "Error al borrar !!"
                });
            }

            if (!articleDelete) {
                return res.status(404).send({
                    status: "error",
                    message: "No se ha borrado ningún articulo"
                });
            }

            return res.status(200).send({
                status: "success",
                articleDelete
            });
        });
    }, 

    upload: (req, res) => {
        // recoger el id del articulo por la URL
        var articleId = req.params.id;

        // Recoger el archivo de la petición
        if (!req.files) {
            return res.status(404).send({
                status: "error",
                message: 'El archivo no fue adjuntado'
            });
        }

        // Conseguir el nombre y la extensión del archivo
        var filePath = req.files.file0.path;
        var fileSplit = filePath.split('/');
        var fileName = fileSplit[fileSplit.length - 1];
        var fileExt = fileName.split('.')[1];

        // Comprobar la extensión solo imagenes, si es valida borra el archivo
        if (fileExt.toUpperCase() != 'PNG' && fileExt.toUpperCase() != 'JPG' && fileExt.toUpperCase() != 'JPEG' && fileExt.toUpperCase() != 'GIF') {
            // borra el archivo subido
            fs.unlink(filePath, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'La extensión del archivo no es valida'
                })
            });
        } else {
            //Si todo el valido, actualiza la imagen
            Article.findOneAndUpdate({_id: articleId}, {image: fileName}, {new: true}, (err, articleUpdate) => {

                if (err || !articleUpdate) {
                    return res.status(200).send({
                        status: 'error',
                        message: 'Error al guardar la imagen'
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdate
                })
            })
        }
    },

    getImage: (req, res) => {        
        var file = req.params.image;
        var pathFile = './upload/articles/' + file
        
        fs.exists(pathFile, (exists) => {
            if (exists) {
                return res.sendFile(path.resolve(pathFile));
            } else {
                return res.status(404).send({
                    status: "error",
                    message: "El archivo no existe!!"
                })
            }
        });
    },

    search: (req, res) => {
        // recuperar la busqueda
        var searchString = req.params.search;
        
        // Find Or
        Article.find({ "$or": [
            { "title": { "$regex": searchString, "$options": "i"} },
            { "content": { "$regex": searchString, "$options": "i"} },
        ]})
        .sort([['date', 'descending']])
        .exec((err, articles) => {
            if (err) {
                return res.status(500).send({
                    status: "error",
                    message: "Error en la petición"
                })
            }

            if (!articles || articles.length <= 0) {
                return res.status(404).send({
                    status: "error",
                    message: "No existen articulos con tu busqueda"
                })
            }

            return res.status(200).send({
                status: "success",
                message: articles
            })
        })
    }

};  // End Controller

module.exports = controller;