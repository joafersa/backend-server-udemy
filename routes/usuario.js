// Requires
var express = require("express");
var bcrypt = require("bcryptjs");
var mdAutenticacion = require("../middlewares/autenticacion");

// Inicializar variables
var app = express();
//var SEED = require("../config/config").SEED;

// Modelo de usuario
var Usuario = require("../models/usuario");

// ==============================================
//  Obtener todos los usuarios: sin autenticacion
// ==============================================
app.get("/", (req, res, next) => {
  // paginacion: desde puede ser vacio
  let desde = req.query.desde || 0;
  // desde debe ser un numero
  desde = Number(desde);

  Usuario.find(
    {
      // query
    },
    // campos
    "nombre email img role"
  )
    // paginacion
    .skip(desde)
    .limit(5)

    .exec((err, usuarios) => {
      // error bd
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando usuarios",
          errors: err
        });
      }

      // total usuarios
      Usuario.count(
        {
          /*filtro*/
        },
        (err, cuenta) => {
          // ok
          res.status(200).json({
            ok: true,
            usuarios: usuarios,
            total: cuenta
          });
        }
      );
    });
});

// // ==============================================
// //  Verificar token (versión 1, para peticiones que van después en el código, no recomendable)
// // ==============================================
// app.use("/", (req, res, next) => {
//   // token en url
//   var token = req.query.token;

//   jwt.verify(token, SEED, (err, decoded) => {
//     // error de token
//     if (err) {
//       return res.status(401).json({
//         ok: false,
//         mensaje: "Token incorrecto",
//         errors: err
//       });
//     }

//     // si no hay error, sigue (siguientes funciones, post, put, delete)
//     next();
//   });
// });

// ==============================================
//  Crear un nuevo usuario (con autenticacion: verificaToken)
// ==============================================
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
  // Uso BodyParser: libreria que toma la informacion del post y crea un objeto de javascript
  var body = req.body;

  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10), // encripto la contraseña con bcrypt (hash de 10 pasadas)
    img: body.img,
    role: body.role
  });

  usuario.save((err, usuarioGuardado) => {
    // bad request
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear usuario",
        errors: err
      });
    }

    // ok recurso creado
    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuariotoken: req.usuario
    });
  });
});

// ==============================================
//  Actualizar usuario (con autenticacion: verificaToken)
// ==============================================
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Usuario.findById(id, (err, usuario) => {
    // Si devuelve error es de bd
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err
      });
    }

    // Si no existe el usuario devuelve null
    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: `El usuario con el id ${id} no existe`,
        errors: { message: "No existe un usuario con ese id" }
      });
    }

    // Existe el usuario id: actualizo el usuario encontrado con los valores del body
    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((err, usuarioGuardado) => {
      // bad request
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar usuario",
          errors: err
        });
      }

      // para no mostrar el password en la respuesta
      usuarioGuardado.password = ":)"; // aquí no estoy actualizando el password porque ya ha pasado el save, esto es el callback

      // ok
      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado,
        usuariotoken: req.usuario
      });
    });
  });
});

// ==============================================
//  Borrar usuario por el id (con autenticacion: verificaToken)
// ==============================================
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    // err de bd al borrar
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar usuario",
        errors: err
      });
    }

    // si el usuario no existe usuarioBorrado es null
    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: `El usuario con el id ${id} no existe`,
        errors: { message: "No existe un usuario con ese id" }
      });
    }

    // ok
    res.status(200).json({
      ok: true,
      usuario: usuarioBorrado,
      usuariotoken: req.usuario
    });
  });
});

module.exports = app;
