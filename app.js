'use strict'

//requires

var express = require('express');
var bodyParser = require('body-parser');


//ejecutar express

var app = express();

//cargar archivos de rutas


//añadir middlewares

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//CORS

//reescribir rutas

//ruta/metodo de prueba
app.get('/prueba', (req, res) => {
    return res.status(200).send("<h1> Hola mundo soy el backend</h1>");
    /*return res.status(200).send({
        nombre: "Yvonne",
        message: 'Hola mundo desde el back-end con Node'
    });*/
});

app.post('/prueba', (req, res) => {
    return res.status(200).send({
        nombre: "Yvonne",
        message: 'Hola mundo desde el back-end con Node soy un  metodo POST'
    });
});

//exportar el modulo

module.exports = app;

