// Requires

// aplicaciones web en servidor node
var express = require('express');
// uso de bd mongo
var mongoose = require('mongoose');
// manejo de objetos que usaremos en el body de los request (post, put...)
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// Body Parser (MIDDLEWARE): libreria que toma la informacion del post y crea un objeto de javascript
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var loginRoutes = require('./routes/login');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

// Conexión a la BD
mongoose.connection.openUri(
  'mongodb://localhost:27017/hospitalDB',
  (err, res) => {
    if (err) throw err;
    console.log('Base de datos: \x1b[7m %s \x1b[0m', 'online');
  }
);

// Server index config: permite acceder al servidor a localhost:3000/uploads y ver las imagenes subidas
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas (MIDDLEWARE)
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);

app.use('/', appRoutes);

// Escuchar peticiones en el puerto 3000
app.listen(3000, () => {
  console.log('Express server en puerto 3000: \x1b[7m %s \x1b[0m', 'online');
});
