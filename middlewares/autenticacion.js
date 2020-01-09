// Requires
var jwt = require('jsonwebtoken');

// Inicializar variables
var SEED = require('../config/config').SEED;

// ==============================================
//  Verificar token
// ==============================================
exports.verificaToken = function(req, res, next) {
  // token en url
  var token = req.query.token;

  jwt.verify(token, SEED, (err, decoded) => {
    // error de token
    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Token incorrecto',
        errors: err
      });
    }

    // pongo la informacion del usuario en el request
    req.usuario = decoded.usuario;

    // si no hay error, sigue
    next();

    // return res.status(200).json({
    //   ok: true,
    //   decoded: decoded
    // });
  });
};
