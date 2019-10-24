// Requires
var express = require("express");
var mdAutenticacion = require("../middlewares/autenticacion");

// Inicializar variables
var app = express();

// Modelo de usuario
var Medico = require("../models/medico");

// ==============================================
//  Obtener todos los medicos: sin autenticacion
// ==============================================
app.get("/", (req, res, next) => {
  // paginacion: desde puede ser vacio
  let desde = req.query.desde || 0;
  // desde debe ser un numero
  desde = Number(desde);

  Medico.find(
    {
      // query
    }
    // campos (si no pongo nada son todos)
  )
    // paginacion
    .skip(desde)
    .limit(5)

    // campos relacionados
    .populate("usuario", "nombre email")
    .populate("hospital")

    .exec((err, medicos) => {
      // error bd
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando medicos",
          errors: err
        });
      }

      Medico.count({}, (err, cuenta) => {
        // ok
        res.status(200).json({
          ok: true,
          medicos: medicos,
          total: cuenta
        });
      });
    });
});

// ==============================================
//  Crear un nuevo medico (con autenticacion: verificaToken)
// ==============================================
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
  // Uso BodyParser: libreria que toma la informacion del post y crea un objeto de javascript
  var body = req.body;

  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital
  });

  medico.save((err, medicoGuardado) => {
    // bad request
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear médico",
        errors: err
      });
    }

    // ok recurso creado
    res.status(201).json({
      ok: true,
      medico: medicoGuardado
    });
  });
});

// ==============================================
//  Actualizar medico (con autenticacion: verificaToken)
// ==============================================
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Medico.findById(id, (err, medico) => {
    // Si devuelve error es de bd
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar médico",
        errors: err
      });
    }

    // Si no existe el medico devuelve null
    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: `El médico con el id ${id} no existe`,
        errors: { message: "No existe un médico con ese id" }
      });
    }

    // Existe el medico id: actualizo el medico encontrado con los valores del body
    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;

    medico.save((err, medicoGuardado) => {
      // bad request
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar médico",
          errors: err
        });
      }

      // ok
      res.status(200).json({
        ok: true,
        medico: medicoGuardado
      });
    });
  });
});

// ==============================================
//  Borrar medico por el id (con autenticacion: verificaToken)
// ==============================================
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    // err de bd al borrar
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar médico",
        errors: err
      });
    }

    // si el medico no existe medicoBorrado es null
    if (!medicoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: `El médico con el id ${id} no existe`,
        errors: { message: "No existe un médico con ese id" }
      });
    }

    // ok
    res.status(200).json({
      ok: true,
      medico: medicoBorrado
    });
  });
});

module.exports = app;
