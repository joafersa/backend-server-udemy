// Requires
var express = require("express");
var mdAutenticacion = require("../middlewares/autenticacion");

// Inicializar variables
var app = express();

// Modelo de usuario
var Hospital = require("../models/hospital");

// ==============================================
//  Obtener todos los hospitales: sin autenticacion
// ==============================================
app.get("/", (req, res, next) => {
  // paginacion: desde puede ser vacio
  let desde = req.query.desde || 0;
  // desde debe ser un numero
  desde = Number(desde);

  Hospital.find(
    {
      // query
    }
    // campos (si no pongo nada son todos)
  )
    // paginacion
    .skip(desde)
    .limit(5)

    .populate("usuario", "nombre email")
    .exec((err, hospitales) => {
      // error bd
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando hospitales",
          errors: err
        });
      }

      Hospital.count({}, (err, cuenta) => {
        // ok
        res.status(200).json({
          ok: true,
          hospitales: hospitales,
          total: cuenta
        });
      });
    });
});

// ==============================================
//  Crear un nuevo hospital (con autenticacion: verificaToken)
// ==============================================
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
  // Uso BodyParser: libreria que toma la informacion del post y crea un objeto de javascript
  var body = req.body;

  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });

  hospital.save((err, hospitalGuardado) => {
    // bad request
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear hospital",
        errors: err
      });
    }

    // ok recurso creado
    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado
    });
  });
});

// ==============================================
//  Actualizar hospital (con autenticacion: verificaToken)
// ==============================================
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Hospital.findById(id, (err, hospital) => {
    // Si devuelve error es de bd
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar hospital",
        errors: err
      });
    }

    // Si no existe el hospital devuelve null
    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: `El hospital con el id ${id} no existe`,
        errors: { message: "No existe un hospital con ese id" }
      });
    }

    // Existe el hospital id: actualizo el hospital encontrado con los valores del body
    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;

    hospital.save((err, hospitalGuardado) => {
      // bad request
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar hospital",
          errors: err
        });
      }

      // ok
      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado
      });
    });
  });
});

// ==============================================
//  Borrar hospital por el id (con autenticacion: verificaToken)
// ==============================================
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
    // err de bd al borrar
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar hospital",
        errors: err
      });
    }

    // si el hospital no existe hospitalBorrado es null
    if (!hospitalBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: `El hospital con el id ${id} no existe`,
        errors: { message: "No existe un hospital con ese id" }
      });
    }

    // ok
    res.status(200).json({
      ok: true,
      hospital: hospitalBorrado
    });
  });
});

module.exports = app;
