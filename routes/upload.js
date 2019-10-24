// Requires
var express = require("express");
var fileUpload = require("express-fileupload");
var fs = require("fs"); // filesystem

// Inicializar variables
var app = express();

// Modelos
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");

// Middleware
app.use(fileUpload());

// Rutas
app.put("/:tipo/:id", (req, res) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  // tipos validos de coleccion
  var tiposValidos = ["usuarios", "hospitales", "medicos"];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Tipo de colección inválido",
      errors: {
        message: "Las colecciones admitidas son: " + tiposValidos.join(", ")
      }
    });
  }

  // si no llegan archivos: error
  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se ha seleccionado archivos",
      errors: { message: "Debe seleccionar alguna imagen" }
    });
  }

  // obtener nombre del archivo
  var archivo = req.files.imagen;
  // extension del archivo
  var partesNombre = archivo.name.split("."); // partes del nombre del archivo separadas por .
  var extensionArchivo = partesNombre[partesNombre.length - 1]; // cojo la ultima parte

  // extension de archivo aceptadas
  var extensionesValidas = ["png", "jpg", "gif", "jpeg"];
  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Extensión no válida",
      errors: {
        message:
          "Las extensiones admitidas son " + extensionesValidas.join(", ")
      }
    });
  }

  // nombre de archivo personalizado 112451212121-123.jpg
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  //mover el archivo
  var path = `uploads/${tipo}/${nombreArchivo}`;
  archivo.mv(path, err => {
    // error
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al mover archivo",
        errors: err
      });
    }

    subirImagenPorTipo(tipo, id, nombreArchivo, res);

    // la respuesta la doy en subirImagenPorTipo
    // res.status(200).json({
    //   ok: true,
    //   mensaje: "Archivo movido",
    //   extensionArchivo: extensionArchivo
    // });
  });
});

function subirImagenPorTipo(tipo, id, nombreArchivo, res) {
  switch (tipo) {
    case "usuarios":
      Usuario.findById(id, (err, usuario) => {
        // usuario no existe
        if (!usuario) {
          return res.status(400).json({
            ok: false,
            mensaje: "Usuario no existe",
            errors: { message: "Usuario no existe" }
          });
        }

        var pathViejo = "./uploads/usuarios/" + usuario.img;

        // borrar imagen anterior si existe
        if (fs.existsSync(pathViejo)) {
          fs.unlinkSync(pathViejo);
        }

        // guardo el nuevo nombre de imagen
        usuario.img = nombreArchivo;

        // lo guardo
        usuario.save((err, usuarioActualizado) => {
          usuarioActualizado.password = ":)";
          return res.status(200).json({
            ok: true,
            mensaje: "Imagen de usuario actualizada",
            usuario: usuarioActualizado
          });
        });
      });
      break;
    case "hospitales":
      Hospital.findById(id, (err, hospital) => {
        // hospital no existe
        if (!hospital) {
          return res.status(400).json({
            ok: false,
            mensaje: "Hospital no existe",
            errors: { message: "Hospital no existe" }
          });
        }

        var pathViejo = "./uploads/hospitales/" + hospital.img;

        // borrar imagen anterior si existe
        if (fs.existsSync(pathViejo)) {
          fs.unlinkSync(pathViejo);
        }

        // guardo el nuevo nombre de imagen
        hospital.img = nombreArchivo;

        // lo guardo
        hospital.save((err, hospitalActualizado) => {
          return res.status(200).json({
            ok: true,
            mensaje: "Imagen de hospital actualizada",
            hospital: hospitalActualizado
          });
        });
      });
      break;

    case "medicos":
      Medico.findById(id, (err, medico) => {
        // medico no existe
        if (!medico) {
          return res.status(400).json({
            ok: false,
            mensaje: "Médico no existe",
            errors: { message: "Médico no existe" }
          });
        }

        var pathViejo = "./uploads/medicos/" + medico.img;

        // borrar imagen anterior si existe
        if (fs.existsSync(pathViejo)) {
          fs.unlinkSync(pathViejo);
        }

        // guardo el nuevo nombre de imagen
        medico.img = nombreArchivo;

        // lo guardo
        medico.save((err, medicoActualizado) => {
          return res.status(200).json({
            ok: true,
            mensaje: "Imagen de médico actualizada",
            medico: medicoActualizado
          });
        });
      });
      break;

    default:
      break;
  }
}

module.exports = app;
