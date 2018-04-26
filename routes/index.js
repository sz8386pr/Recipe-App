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
	console.log(site, keyword, page);   // debug


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

router.post('/create-recipe', function(req, res, next) {
	let newRecipe = new recipe({
		author: req.user.username, title: req.body.title, category: req.body.category, description: req.body.description,
		duration:{ value: req.body.duration_value, unit: req.body.duration_unit}, serving: req.body.serving,
		ingredients: [ {value: req.body.ingredients_value, unit: req.body.ingredients_unit, name: req.body.ingredients_name} ],
		directions: [req.body.directions], source: 'local'
	});
	console.log(req.body.ingredients_value, req.body.ingredients_unit, req.body.ingredients_name);
	// save the task, and redirect to home page if successful
	newRecipe.save().then((recipe) => {
		console.log('New recipe created: ', recipe); //debug
		res.redirect('/');  // Creates a GET request to
	}).catch((err) => {
		next(err);  // Forward error to the error handlers
	});
});






// used for testing during development
router.get('/test', function(req, res, next) {
	res.render('./recipe/create_recipe', { user: req.user });
});

module.exports = router;
