'use strict'

var validator = require('validator');
var User = require('../models/user');
var bcrypt = require('bcrypt-node');
var jwt = require('../services/jwt');

var controller = {

    probando: function(req, res){
        return res.status(200).send({
            message: "Soy el metodo Probando"
        });
    },

    testeando: function(req, res){
        return res.status(200).send({
            message: "Soy el metodo Testeando"
        });
    },

    save: function(req, res){
        //recoger los parametros de la peticion
        var params = req.body;

        //validar los datos
        var validate_name = !validator.isEmpty(params.name);
        var validate_surname = !validator.isEmpty(params.surname);
        var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        var validate_password = !validator.isEmpty(params.password);

        console.log(validate_name, validate_surname, validate_email, validate_password);

        if(validate_name && validate_surname && validate_email && validate_password){
        
        //crear objeto de usuario
            var user = new User();

        //asignar valores al usuario
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email;
            user.role = 'ROLE_USER';
            user.image = null;
    
        //comprobar si el usuario existe
        User.findOne({email: user.email}, (err, issetUser) =>{
            if(err){
                return res.status(500).send({
                    message: "Error al comprobar duplicidad de usuario"
                });
            }
            if(!issetUser){
               // si no existe
                
               // cifrar la contraseña 
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;
                    
                    // guardar usuario
                    user.save((err, userStored) => {
                        if(err){
                            return res.status(500).send({
                                message: "Error al guardar el usuario"
                            });
                        }
                        if(!userStored){
                            return res.status(400).send({
                                message: "El usuario no se ha guardado"
                            });
                        }
                      
                        //devolver respuesta
                        return res.status(200).send({
                            status: 'success',
                            user: userStored
                        });
                    });//close save
                });//close bcrypt
                }else{
                return res.status(200).send({
                    message: "El usuario ya esta registrado"
                });
            }
        });        
    
        //devolver respuesta
        }else{
            return res.status(200).send({
                message: "Validacion de los datos de usuario incorrecta, intentelo de nuevo"
            });
        }   

    },

    login: function(req, res){
        //recoger los parametros de la peticion
            var params = req.body;
        //validar los datos
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);


            if(!validate_email && !validate_password){
                return res.status(200).send({
                    message: "Los datos son incorrectos, envialos bien"
                });
            } 
                //buscar los usuarios que cuincidan con e email

                User.findOne({email: params.email.toLowerCase()}, (err, user) =>{

                    if(err){
                        return res.status(500).send({
                            message: "Error al intentar identificarse"
                        });
                    }
                    if(!user){
                        return res.status(404).send({
                            message: "El usuario no existe"
                        });
                    }
                    //si lo encuentra
                    //comprobar la contraseña (coincidencia de email y passw /bcrypt)
                    bcrypt.compare(params.password, user.password, (err, check) =>{
                        //si es correcto
                        if(check){
                            //generar token de jwt y devolverlo (mas tarde)
                            if(params.gettoken){
                                //devolver los datos
                                return res.status(200).send({
                                    token: jwt.createTocken(user)
                                });
                            }else{
                                //limpiar el objeto antes de devolverlo
                                user.password = undefined;
                                //devolver los datos
                                return res.status(200).send({
                                    status: "success",
                                    user
                                });
                            }                           
                            
                        }else{
                            return res.status(200).send({
                                message: "Las credenciales no son correctas"
                            });
                        }
                    });
                    
                });
                                   
    }
};

module.exports = controller;