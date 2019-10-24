// Requires
var express = require("express");

// Inicializar variables
var app = express();

// Modelos
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");

// ==============================================
//  Búsqueda por colección
// ==============================================
app.get("/coleccion/:tabla/:busqueda", (req, res) => {
  var tabla = req.params.tabla;
  var busqueda = req.params.busqueda;

  // búsqueda por expresión regular sin tener en cuenta las mayúsculas/minúsculas
  var regex = new RegExp(busqueda, "i");

  var promesa;

  switch (tabla) {
    case "hospitales":
      promesa = buscarHospitales(busqueda, regex);
      break;
    case "medicos":
      promesa = buscarMedicos(busqueda, regex);
      break;
    case "usuarios":
      promesa = buscarUsuarios(busqueda, regex);
      break;
    default:
      return res.status(400).json({
        ok: false,
        mensaje:
          "Los tipos de búsqueda solo son: usuarios, medicos y hospitales",
        error: { message: "Tipo de tabla/colección no válido" }
      });
  }

  promesa.then(respuestas => {
    // ok
    res.status(200).json({
      ok: true,
      // en lugar de la palabra tabla, pongo [tabla] para que saque el resultado de evaluar tabla
      [tabla]: respuestas
    });
  });
});

// ==============================================
//  Búsqueda general
// ==============================================
app.get("/todo/:busqueda", (req, res) => {
  var busqueda = req.params.busqueda;

  // búsqueda exacta
  // Hospital.find({ nombre: busqueda }, (err, hospitales) => {

  // búsqueda por expresión regular sin tener en cuenta las mayúsculas/minúsculas
  var regex = new RegExp(busqueda, "i");

  // llamo a la funciones asíncronas (array de promesas)
  // el then recibe un array de respuestas
  Promise.all([
    buscarHospitales(busqueda, regex),
    buscarMedicos(busqueda, regex),
    buscarUsuarios(busqueda, regex)
  ]).then(respuestas => {
    // ok
    res.status(200).json({
      ok: true,
      hospitales: respuestas[0],
      medicos: respuestas[1],
      usuarios: respuestas[2]
    });
  });
});

// búsqueda asíncrona de hospitales
function buscarHospitales(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regex })
      .populate("usuario", "nombre email")
      .exec((err, hospitales) => {
        if (err) {
          reject("Error al cargar hospitales", err);
        } else {
          resolve(hospitales);
        }
      });
  });
}

// búsqueda asíncrona de médicos
function buscarMedicos(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regex })
      .populate("usuario", "nombre email")
      .populate("hospital")
      .exec((err, medicos) => {
        if (err) {
          reject("Error al cargar médicos", err);
        } else {
          resolve(medicos);
        }
      });
  });
}

// búsqueda asíncrona de usuarios (búsqueda en 2 columnas)
function buscarUsuarios(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Usuario.find(
      {
        /*filtro*/
      },
      "nombre email role"
    )
      .or([{ nombre: regex }, { email: regex }])
      .exec((err, usuarios) => {
        if (err) {
          reject("Error al cargar usuarios", err);
        } else {
          resolve(usuarios);
        }
      });
  });
}
module.exports = app;
