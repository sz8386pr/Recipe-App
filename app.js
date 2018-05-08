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
var recipeRouter = require('./routes/recipe');
var userRouter = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));


// hbs helpers
hbs.registerHelper('toUpper', function(str) {   //toUpper will change string to uppercase
	return str.toUpperCase();
});
hbs.registerHelper('greaterThan', function(from, to) {  //greaterThan will compare if from value > to value
	return parseInt(from) > to
});
hbs.registerHelper('add', function(addTo, value) {
	return parseInt(addTo) + value
});
hbs.registerHelper('equals', function(a, b) {
	return a === b
});

// ifCond reference from https://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
hbs.registerHelper('ifCond', function (v1, operator, v2, options) {
	switch (operator) {
		case '==':
			return (v1 == v2) ? options.fn(this) : options.inverse(this);
		case '===':
			return (v1 === v2) ? options.fn(this) : options.inverse(this);
		case '!=':
			return (v1 != v2) ? options.fn(this) : options.inverse(this);
		case '!==':
			return (v1 !== v2) ? options.fn(this) : options.inverse(this);
		case '<':
			return (v1 < v2) ? options.fn(this) : options.inverse(this);
		case '<=':
			return (v1 <= v2) ? options.fn(this) : options.inverse(this);
		case '>':
			return (v1 > v2) ? options.fn(this) : options.inverse(this);
		case '>=':
			return (v1 >= v2) ? options.fn(this) : options.inverse(this);
		case '&&':
			return (v1 && v2) ? options.fn(this) : options.inverse(this);
		case '||':
			return (v1 || v2) ? options.fn(this) : options.inverse(this);
		default:
			return options.inverse(this);
	}
});
hbs.registerHelper('toFixed', function(value, decimal) {
	return value.toFixed(decimal)
});

// app use setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

// MongoDB & session connection setup
var mongo_url = process.env.MONGO_URL;

app.use(session({
    secret: 'replace me with long random string',
    resave: true,
    saveUninitialized: true,
    store: new MongoDBStore( { uri: mongo_url })
}));

// passport & flash
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(mongo_url)
	.then( () => { console.log('Connected to mLab'); })
	.catch( (err) => { console.log('Error connecting to mLab', err); });

// routers
app.use('/user', userRouter);
app.use('/recipe', recipeRouter);
app.use('/auth', authRouter);
app.use('/', indexRouter);


// catch 404 and redirect to custom 404 page
app.use(function(req, res, next) {
	res.status(404);
    res.render('./error/404_error', {layout: false})    // no layout (mostly for testing the feature)
});

// error handler
app.use(function(err, req, res, next) {

    //If there is validation error ie: email already in use
    if (err.name === "ValidationError") {
        res.status(err.status || 500);  // set the error status to err.status or 500

	    var err_path = Object.keys(err.errors)[0];  // field that caused validation error
	    var flash_message = err.errors[err_path].message;   // flash message
        req.flash('signupMsg', flash_message);

        // redirect to previous page ie: sign up/login
	    var backURL = req.header('Referer');
	    res.redirect(backURL);
    }
    // Usually a duplicate name
    else if (err.name === "MongoError") {
    	// if error message contains duplicate key error, it means that the duplicate name already exists in the db
    	if (err.message.includes('E11000 duplicate key error')) {
		    req.flash('errorMsg', 'Name already exists. Choose a different name');
	    }
	    // redirect to previous page ie: sign up/login
	    backURL = req.header('Referer');
	    res.redirect(backURL);
    }
    else {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('./error/error');
    }
});

module.exports = app;
