// Requires
var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

// Inicializar variables
var app = express();
var SEED = require("../config/config").SEED;

// Modelo de usuario
var Usuario = require("../models/usuario");

// ==============================================
//  Login
// ==============================================
app.post("/", (req, res) => {
  // Uso BodyParser: libreria que toma la informacion del post y crea un objeto de javascript
  var body = req.body;

  // busco el usuario con el email enviado en el body
  Usuario.findOne({ email: body.email }, (err, usuarioBD) => {
    // error de bd
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err
      });
    }

    // el usuario no existe
    if (!usuarioBD) {
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales incorrectas (email)",
        errors: err
      });
    }

    // aqui tengo un usuario válido. Ahora compruebo la contraseña
    if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
      // la contraseña no es correcta
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales incorrectas (password)",
        errors: err
      });
    }

    // aqui el usuario y la contraseña son validos

    // para no mostrar el password en el token
    usuarioBD.password = ":)"; // aquí no estoy actualizando el password porque esto es el callback

    // creo token JWT (Json Web Token) payload, seed, fecha expiracion (4h)
    var token = jwt.sign({ usuario: usuarioBD }, SEED, {
      expiresIn: 14400
    });

    // ok
    res.status(200).json({
      ok: true,
      usuario: usuarioBD,
      token: token,
      id: usuarioBD.id
    });
  });
});

module.exports = app;
