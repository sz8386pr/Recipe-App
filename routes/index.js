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

// user need to get authenticated/logged in
router.use(isLoggedIn);

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { user: req.user });
});

// POST external-recipes/<site>
router.post('/external-recipes', function(req, res, next) {
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
				res.render('external_recipes', {recipes: recipes, site: site, keyword: keyword, user: req.user, page: page});
			}
		}, keyword, page);
	}
	else {
		res.redirect('/')
	}
});

// used for testing during development
router.get('/test', function(req, res, next) {
	res.render('modal_test', { user: req.user });
});

module.exports = router;
