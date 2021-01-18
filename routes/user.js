'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var router = express.Router();
//rutas de pruebas
router.get('/probando', UserController.probando);
router.post('/testeando', UserController.testeando);
//rutas de usuarios
router.post('/register', UserController.save);
router.post('/login', UserController.login);

router.put('/update', UserController.update);

module.exports = router;