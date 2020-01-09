// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Inicializar variables
var app = express();

// Modelo de usuario
var Usuario = require('../models/usuario');

// Google
// guardo el client_id en el archivo config.js
let CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ==============================================
//  Autenticación de Google
// ==============================================
// funcion que retorna una promesa
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  // payload = información del usuario
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];

  // devuelvo lo que quiero del payload
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}

app.post('/google', async (req, res) => {
  var token = req.body.token;

  var googleUser = await verify(token).catch(error => {
    return res.status(403).json({
      ok: false,
      mensaje: 'Token no válido'
    });
  });

  Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {
    // error de bd
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err
      });
    }

    // el usuario existe
    if (usuarioBD) {
      // si el usuario existente no se autenticó con Google, cancelo, pq el usuario no podrá autenticarse ahora con Google con el mismo email
      if (!usuarioBD.google) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Debe usar autenticación normal (usuario/contraseña)'
        });
      } else {
        // aquí la autenticación con Google es válida

        // para no mostrar el password en el token
        usuarioBD.password = ':)'; // aquí no estoy actualizando el password porque esto es el callback

        // creo token JWT (Json Web Token) payload, semilla(seed), fecha expiracion (4h)
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
      }
    } else {
      // el usuario no existe, hay que crearlo
      var usuario = new Usuario();

      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = ':)';

      usuario.save((err, usuarioBD) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error en BD',
            errors: err
          });
        }

        // creo token JWT (Json Web Token) payload, semilla(seed), fecha expiracion (4h)
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
    }
  });
});

// ==============================================
//  Autenticación normal
// ==============================================
app.post('/', (req, res) => {
  // Uso BodyParser: libreria que toma la informacion del post y crea un objeto de javascript
  var body = req.body;

  // busco el usuario con el email enviado en el body
  Usuario.findOne({ email: body.email }, (err, usuarioBD) => {
    // error de bd
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err
      });
    }

    // el usuario no existe
    if (!usuarioBD) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas (email)', // en producción no diré si falla por el email o por el password
        errors: err
      });
    }

    // aquí tengo un usuario válido. Ahora compruebo la contraseña
    if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
      // la contraseña no es correcta
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas (password)', // en producción no diré si falla por el email o por el password
        errors: err
      });
    }

    // aquí el usuario y la contraseña son válidos

    // para no mostrar el password en el token
    usuarioBD.password = ':)'; // aquí no estoy actualizando el password porque esto es el callback

    // creo token JWT (Json Web Token) payload, semilla(seed), fecha expiracion (4h)
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
