var express = require('express');
var app     = express();
var server  = app.listen(3013);

// Middleware.
app.use(require('morgan')('combined'));
app.use(require('compression')());
app.use(express.static('./app/static'));

// Routes.
app.set('view engine', 'jade');
app.use(require('./routes')(app));

app.get('*', function(req, res) {
  res.render('./app/static');
});
