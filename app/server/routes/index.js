var Router = require('express').Router;

module.exports = function(app) {
  var router = Router();

  app.get('*', function(req, res) {
    res.render();
  });

  return router;
};
