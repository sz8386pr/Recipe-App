var express = require('express');
var router = express.Router();
var Allrecipes = require('../services/scrape_allrecipes');
var ar_scrape = Allrecipes.scrape;
var ar_get_recipe = Allrecipes.get_recipe;

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	}
	else {
		res.redirect('/auth/login')
	}
}

/* GET home page. */
router.get('/', isLoggedIn, function(req, res, next) {
    res.render('index', { user: req.user });
});

// POST home page
router.post('/', isLoggedIn, function(req, res, next) {
	let site = req.body.site;
	let keyword = req.body.keyword;
	let page = req.body.page;

	// If it's coming from the search page, page value will be set to 1
	if (page === undefined) {
		page = '1'
	}
	console.log(site, keyword, page);


	if (site === 'allrecipes') {

		ar_get_recipe(function(err, recipes){
			if (err){
				res.render('error') // TODO render error page
			} else {
				res.render('external_recipes', {recipes: recipes});
			}
		}, keyword, page);
	}
	else {
		res.render('index')
	}

});

module.exports = router;
