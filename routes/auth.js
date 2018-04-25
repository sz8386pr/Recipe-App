var express = require('express');
var passport = require('passport');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});


// GET login page
router.get('/login', function(req, res, next) {
    res.render('./auth/login')
});

// POST login page
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
}));


// GET signup page
router.get('/signup', function(req, res, next) {
	res.render('./auth/signup')
});

// POST signup page.
router.post('/signup', passport.authenticate('local-signup', {
	successRedirect: '/',
	failureRedirect: '/auth/signup',
	failureFlash: true
}));

// GET logout. Logout and redirect to main page
router.get('/logout', function(req, res, next){
	req.logout();
	res.redirect('/')
});
module.exports = router;
