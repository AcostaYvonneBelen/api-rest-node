'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = "clave-secreta-para-generar-el-token-9999";

exports.authenticated = function(req, res, next){
    //comprobar si llega autorizacion
    if(!req.headers.authorization){
        return res.status(403).send({
            message: 'La peticion no tiene cabecera de authorization'
        });
    }
    //limpiar el token y quitar comillas
    var token = req.headers.authorization.replace(/['"]+/g, '');

    
    try{
        //decodificar el token  
        var payload = jwt.decode(token, secret);
         //comporbar si el token he expirado
        if(payload.exp <= moment().unix()){
            return res.status(404).send({
                message: 'El token he expirado'
            });
        }
    }catch(ex){
        return res.status(404).send({
            message: 'El token no es valido'
        });
    }
   
    //adjuntar usuario identificado a request
    req.user = payload;
    //pasar a la accion

    console.log("ESTAS PASANDO POR EL MIDDLEWARE !!!");

    next();
    
};