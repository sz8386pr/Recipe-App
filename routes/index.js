var express = require('express');
var router = express.Router();
var Allrecipes = require('../services/scrape_allrecipes');
var ar_scrape = Allrecipes.scrape;
var ar_get_recipe = Allrecipes.get_recipe;
var recipe = require('../models/recipe.js');

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
