// const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
require('./app/trace-console-logs');

const app = express();
app.use(cors());

// app.use('/home', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist/ng16-gpx-client')));

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', require('./app/routes'));

app.disable('etag');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // next(createError(404));
  next();
});

// error handler
// app.use(function(err, req, res) {
//   // set locals, only providing error in development
//   if (res.locals) {
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
//   } else {
//     console.log(err.toString())
//   }
//   // render the error page
//   res.sendStatus(err.status || 500);
//   res.render('error');
// });

module.exports = app;
