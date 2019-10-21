// Requires
var express = require("express");
var mongoose = require("mongoose");

// Inicializar variables
var app = express();

// Conexión a la BD
mongoose.connection.openUri(
  "mongodb://localhost:27017/hospitalDB",
  (err, res) => {
    if (err) throw err;
    console.log("Base de datos: \x1b[7m %s \x1b[0m", "online");
  }
);

// Rutas
app.get("/", (req, res, next) => {
  // ok
  res.status(200).json({
    ok: true,
    mensaje: "Petición realizada correctamente"
  });
});

// Escuchar peticiones en el puerto 3000
app.listen(3000, () => {
  console.log("Express server en puerto 3000: \x1b[7m %s \x1b[0m", "online");
});
