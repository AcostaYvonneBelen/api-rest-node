'use strict'

var validator = require('validator');
var User = require('../models/user');
var bcrypt = require('bcrypt-node');
var fs = require('fs');
var path = require('path');
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
        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        }catch(err){
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }
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
        try{
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        }catch(err){
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }
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
    },

    update: function(req, res){
        //0. crear un middleware para comprobar el jwt token, ponerselo a la ruta
        //metodo que se ejecuta antes d que el controlador (intermediario) ejecuta logica nos deja pasar al metodo osino nos devuelve una respuesta

        //recoger los datos del usuario
        var params = req.body;

        //validar los datos
        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        }catch(err){
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }
        
        //eliminar propiedades innecesarias
        delete params.password;
        
        var userId = req.user.sub;
        //console.log(userId);
        //comprobar si el email es unico
        if(req.user.email != params.email){
            User.findOne({email: params.email.toLowerCase()}, (err, user) =>{

                if(err){
                    return res.status(500).send({
                        message: "Error al intentar actualizar"
                    });
                }
                if(user && user.email == params.email){
                    return res.status(200).send({
                        message: "El email no puede ser modificado"
                    });
                }
            });
        }else{
                User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated) => {
                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error al actualizar usuario'
                        });
                    }
                    if(!userUpdated){
                        return res.status(200).send({
                            status: 'error',
                            message: 'No se ha actualizado el usuario'
                        });
                    }
                    //devolver respuesta
                    return res.status(200).send({
                        status: 'success',
                        user: userUpdated
                    });
                });            
            }
    },

    uploadAvatar: function(req, res){
        //configurar el modulo multiparty(md) routes/user.js
        
        //recoger el fichero de la peticion
        var file_name = 'Avatar no subido...';

       if(!req.files){
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
       }
            //conseguir el nombre y la extesion del archivo
            var file_path = req.files.file0.path;
            var file_split = file_path.split('\\');

            //advertencia: en linux o mac var file_split = file_path.split('//');

            //nombre del archivo
            var file_name = file_split[2];

            //extension del archivo
            var ext_split = file_name.split('\.');
            var file_ext = ext_split[1];

            //comprobar extension (solo imagenes), si no es valida borrar fichero subido
            if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
                fs.unlink(file_path, (err) => {
                    return res.status(200).send({
                        status: 'error',
                        message: 'La extension del archivo no es valida.'
                    });
                });
            }else{
            //sacar el id del usuario identifiado
                var userId = req.user.sub;

            //buscar y actualizar documento de bd
                User.findOneAndUpdate({_id: userId}, {image: file_name}, {new:true}, (err, userUpdated) => {
                    if(err || !userUpdated){
                        //devolver respuesta
                        return res.status(500).send({
                            status: 'error',
                            message: 'error al guardar el usuario'
                        });
                    }
                    //devolver respuesta
                    return res.status(200).send({
                        status: 'success',
                        user: userUpdated
                    });
                });
            
        
        }

    }
};

module.exports = controller;