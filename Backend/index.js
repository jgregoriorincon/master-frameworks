'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3900;

let url = 'mongodb://localhost:27017/api_rest_blog';
let opciones = {
    useNewUrlParser: true
};

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect(url, opciones).then(() => {
    console.log('Conexión a BD realizada correctamente!!');

    // Crear servidor y escuchar peticiones HTTP
    app.listen(port, () => {
        console.log('Servidor corriendo en http://localhost:' + port);
    });
});