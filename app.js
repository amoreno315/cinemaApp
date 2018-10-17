//Not in use yet
//const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const logger = require('morgan');
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const moviesRouter = require('./routes/movies');

mongoose.connect('mongodb://localhost/cinemaApp', {
  useNewUrlParser: true,
});


const app = express();

// view engine setup
app.use(expressLayouts);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');



app.use(logger('dev'));
//app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// ANTES DE LAS RUTAS, por favor...
app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  }),
  secret: 'some-string',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(flash());

app.use((req, res, next) => {
  app.locals.currentUser = req.session.currentUser;
  res.locals.currentUser = req.session.currentUser;
  next();
});

app.use((req, res, next) => {

  // We extract the messages separately cause we call req.flash() we'll clean the object flash.
  res.locals.errorMessages = req.flash('error');
  res.locals.infoMessages = req.flash('info');
  res.locals.dangerMessages = req.flash('danger') ;
  res.locals.successMessages = req.flash('success');
  res.locals.warningMessages = req.flash('warning');
  next();
});

// Routers

// app.get('/', (req, res, next) => {
  
// })
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/movies', moviesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404);
  res.render('404.ejs')
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log('error del middle', err);
  res.render('500', { error: err })
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // // render the error page
  // res.status(err.status || 500);
  // res.render('error');
});


module.exports = app;

