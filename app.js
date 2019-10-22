// Requires
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// Inicializar variables
var app = express();

// Body Parser (MIDDLEWARE): libreria que toma la informacion del post y crea un objeto de javascript
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Importar rutas
var appRoutes = require("./routes/app");
var usuarioRoutes = require("./routes/usuario");
var loginRoutes = require("./routes/login");

// Conexión a la BD
mongoose.connection.openUri(
  "mongodb://localhost:27017/hospitalDB",
  (err, res) => {
    if (err) throw err;
    console.log("Base de datos: \x1b[7m %s \x1b[0m", "online");
  }
);

// Rutas (MIDDLEWARE)
app.use("/usuario", usuarioRoutes);
app.use("/login", loginRoutes);
app.use("/", appRoutes);

// Escuchar peticiones en el puerto 3000
app.listen(3000, () => {
  console.log("Express server en puerto 3000: \x1b[7m %s \x1b[0m", "online");
});
