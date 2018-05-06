var express = require('express');
var router = express.Router();
const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET_NAME;

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	}
	else {
		res.redirect('/auth/login')
	}
}

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { user: req.user });
});

// user need to get authenticated/logged in
router.use(isLoggedIn);

// used for testing during development
router.get('/test', function(req, res, next) {
	res.render('./recipe/create_recipe', { user: req.user });
});

module.exports = router;
