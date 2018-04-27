var express = require('express');
var router = express.Router();
var Allrecipes = require('../services/scrape_allrecipes');
var ar_scrape = Allrecipes.scrape;
var ar_get_recipe = Allrecipes.get_recipe;
var Recipe = require('../models/recipe.js');
// var flash = require('express-flash');


function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	}
	else {
		res.redirect('/auth/login')
	}
}

function recipePage(req) {

}

// router.get('/test', function(reg, res, next) {
// 	res.redirect('/')
// });

// user need to get authenticated/logged in
router.use(isLoggedIn);

// global middleware filter reference: https://github.com/expressjs/body-parser/issues/245
// router.use((req, res, next) => shouldParseRequest(req) ? isLoggedIn : next());




// GET recipe/external-search page
router.get('/external-search', function(req, res, next) {
	res.render('./recipe/external-search', {user: req.user})
});

// POST external-recipes/<site>
router.post('/external-search/:site', function(req, res, next) {
	// req.params.site;
	let site = req.body.site;
	let keyword = req.body.keyword;
	let page = req.body.page;

	// If it's coming from the search page, page value will be set to 1
	if (page === undefined) {
		page = '1'
	}
	console.log(site, keyword, page);   // debug


	if (keyword === ''){
		req.flash('searchMsg', 'Enter a search keyword');
		res.redirect('/recipe/external-search');
	}
	else if (site === undefined) {
		req.flash('searchMsg', 'pick a site');
		res.redirect('/recipe/external-search')
	}
	else if (site === 'allrecipes') {

		ar_get_recipe(function(err, recipes){
			if (err){
				res.render('error') // TODO render error page
			} else {
				res.render('./recipe/external_recipes', {recipes: recipes, site: site, keyword: keyword, user: req.user, page: page});
			}
		}, keyword, page);
	}
	else {
		res.redirect('/recipe/external-search');
	}
});


// GET recipe create page
// used for testing during development
router.get('/create', function(req, res, next) {
	res.render('./recipe/create', { user: req.user });
});

// POST recipe create page
router.post('/create', function(req, res, next) {

	// create initial new recipe object
	let newRecipe = new Recipe({
		author: req.user.username, title: req.body.title, category: req.body.category, description: req.body.description,
		duration:{ value: req.body.duration_value, unit: req.body.duration_unit}, serving: req.body.serving,
		source: 'local'
	});

	// if the ingredients value/unit/name is an array/object push to the ingredients list
	if (typeof req.body.ingredients_value === 'object') {
		for (var i=0; i < req.body.ingredients_value.length; i++) {
			newRecipe.ingredients.push({value: req.body.ingredients_value[i], unit: req.body.ingredients_unit[i], name: req.body.ingredients_name[i]})
		}
	}
	else{
		newRecipe.ingredients = {value: req.body.ingredients_value, unit: req.body.ingredients_unit, name: req.body.ingredients_name}
	}

	// if the directions is an array, push to the list
	if (typeof req.body.directions === 'object') {
		for (var ind = 0; ind < req.body.directions.length; ind++) {
			newRecipe.directions.push(req.body.directions[ind])
		}
	}
	else{
		newRecipe.directions = req.body.directions
	}

	// save the task, and redirect to home page if successful
	newRecipe.save()
		.then((recipe) => {
		console.log('New recipe created: ', recipe); //debug
		res.render('./recipe/recipe', {user: req.user, recipe: newRecipe}) // Creates a GET request to

	})
	.catch((err) => {
		req.flash('errorMsg', 'Error creating recipe');
		next(err);  // Forward error to the error handlers
	});
});





router.get('/all-recipes', function(req, res, next) {
	Recipe.find({}, function(err, recipes) {
		if (err) {
			res.redirect('/')
		}
		else {
			res.render('./recipe/all_recipes', {user: req.user, recipes: recipes})
		}
	})
});

// GET recipe page. Needs to be at the very bottom else other pages below wouldn't be used
router.get('/:title', function(req, res, next) {
	console.log(req.params.title);
	Recipe.findOne({'title': req.params.title})
		.then( (recipe) => {
			res.render('./recipe/recipe', {user: req.user, recipe: recipe});
		})
		.catch( (error) => {
			req.flash('errorMsg', error);
			res.redirect('/');
		})
});

module.exports = router;
