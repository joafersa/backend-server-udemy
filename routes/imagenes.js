// Requires
var express = require('express');

// necesarios para manejar paths y ficheros (ya vienen en node, no es necesario instalarlos con npm install)
const path = require('path');
const fs = require('fs');

// Inicializar variables
var app = express();

// Rutas
app.get('/:tipo/:img', (req, res, next) => {
  var tipo = req.params.tipo;
  var img = req.params.img;

  var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

  if (fs.existsSync(pathImagen)) {
    res.sendFile(pathImagen);
  } else {
    var pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
    res.sendFile(pathNoImagen);
  }
});

module.exports = app;