'use strict'

//requires

var express = require('express');
var bodyParser = require('body-parser');


//ejecutar express

var app = express();

//cargar archivos de rutas
var user_routes = require('./routes/user');

//añadir middlewares

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//CORS

//reescribir rutas
app.use('/api', user_routes);

//exportar el modulo

module.exports = app;

