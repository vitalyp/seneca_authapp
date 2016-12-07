var DB_NAME = "seneca_authapp";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Session = require('express-session');

var index = require('./routes/index');
var users = require('./routes/users');

// create a seneca instance
var seneca = require('seneca')();

// load configuration for plugins
// top level properties match plugin names
// copy template config.template.js to config.mine.js and customize
var options = seneca.options('config.mine.js');

// use the user, auth and entity plugins
// the user plugin gives you user account business logic
seneca.use('user');


// the auth plugin handles HTTP authentication
seneca.use('auth', options.auth);

seneca.use('mongo-store', {
  uri: 'mongodb://localhost:27017/' + DB_NAME
});

// the entity plugin provides an active-record like orm
seneca.use('entity');

// the local-auth handles local auth strategy
seneca.use('local-auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Use in-memory sessions so OAuth will work
// In production, use redis or similar
app.use(Session({secret: 'seneca'}));

// add seneca middleware
app.use(seneca.export('web'));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
