var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');

var session = require('express-session');
var passport = require('passport');
var flash = require('express-flash');
var mongoose = require('mongoose');
var MongoDBStore = require('connect-mongodb-session')(session);

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




var mongo_url = process.env.MONGO_URL;

app.use(session({
    secret: 'replace me with long random string',
    resave: true,
    saveUninitialized: true,
    store: new MongoDBStore( { uri: mongo_url })
}));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

mongoose.connect(mongo_url)
    .then( () => { console.log('Connected to mLab'); })
    .catch( (err) => { console.log('Error connecting to mLab', err); });

app.use('/auth', authRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

    //If there is validation error ie: email already in use
    if (err.name === "ValidationError") {
        res.status(err.status || 500);  // set the error status to 500

	    var err_path = Object.keys(err.errors)[0];  // field that caused validation error
	    var flash_message = err.errors[err_path].message;   // flash message
        req.flash('signupMsg', flash_message);

        // redirect to prevoius page ie: sign up/login
	    var backURL = req.header('Referer');
	    res.redirect(backURL);
    }
    else {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};


        // render the error page
        res.status(err.status || 500);
        res.render('error');
    }
});

module.exports = app;
