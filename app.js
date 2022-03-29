var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var kAmdaniRouter = require('./routes/k_amdani');
var kAnganRouter = require('./routes/k_angan');
var kKashtkarRouter = require('./routes/k_kashtkar');
var kMaweshiRouter = require('./routes/k_maweshi');
var kMuhafizRouter = require('./routes/k_muhafiz');
var kNamaRouter = require('./routes/k_nama');
var kSehatRouter = require('./routes/k_sehat');
var kTahaffuzRouter = require('./routes/k_tahaffuz');
var kZamindarRouter = require('./routes/k_zamindar');
var kZindagiRouter = require('./routes/k_zindagi');
var zaraiDirectoryRouter = require('./routes/zarai_directory');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/k-amdani', kAmdaniRouter);
app.use('/k-angan', kAnganRouter);
app.use('/k-kashtkar', kKashtkarRouter);
app.use('/k-maweshi', kMaweshiRouter);
app.use('/k-muhafiz', kMuhafizRouter);
app.use('/k-nama', kNamaRouter);
app.use('/k-sehat', kSehatRouter);
app.use('/k-tahaffuz', kTahaffuzRouter);
app.use('/k-zamindar', kZamindarRouter);
app.use('/k-zindagi', kZindagiRouter);
app.use('/zarai-directory', zaraiDirectoryRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  const errCode = err ? err.status : 500;

  console.log(err)

  // render the error page
  res.status(errCode|| 500);
  res.render('error');
});

module.exports = app;
