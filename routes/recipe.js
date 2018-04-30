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






router.use(isLoggedIn);
// router.get('/test', function(reg, res, next) {
// 	res.redirect('/')
// });

// user need to get authenticated/logged in


// global middleware filter reference: https://stackoverflow.com/questions/19337446/is-it-possible-to-disable-remove-a-middleware-for-specific-route-in-expressjs
// function maybe(fn) {
// 	return function(req, res, next) {
// 		if (req.path === '/posts/add' && req.method === 'POST') {
// 			next();
// 		} else {
// 			fn(req, res, next);
// 		}
// 	}
// }
// And then modify the app.use statement:
//
// 	app.use(maybe(express.bodyParser()));

// GET recipe page. Needs to be at the very bottom else other pages below wouldn't be used
router.get('/recipes/:title', function(req, res, next) {
	let username = req.user.username;
	Recipe.findOne({'title': req.params.title})
		.then( (recipe) => {
			// If user is either author or saver of the recipe, render the recipe page
			if (username === recipe.author || username === recipe.saved_by)
			{
				res.render('./recipe/recipe', {user: req.user, recipe: recipe});
			}
			else {
				// otherwise, only display if recipe is published
				if (recipe.published === true) {
					res.render('./recipe/recipe', {user: req.user, recipe: recipe});
				}
				else {
					req.flash('errorMsg', 'Unauthorized access. This recipe is not published yet')
					res.status(403);
					next()
				}
			}
		})
		.catch( (error) => {
			req.flash('errorMsg', error);
			next(error)
		})
});

// GET all recipe lists
// add published: true for find condition
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
	// console.log(site, keyword, page);   // debug

	// If there is no keyword
	if (keyword === ''){
		req.flash('searchMsg', 'Enter a search keyword');
		res.redirect('/recipe/external-search');
	}
	// or site value is not entered, redirect to external-search page with the flash error message
	else if (site === undefined) {
		req.flash('searchMsg', 'pick a site');
		res.redirect('/recipe/external-search')
	}

	// else continue
	// if site is allrecipes, call all recipes get_recipe function
	if (site === 'allrecipes') {

		ar_get_recipe(function(err, recipes){
			if (err){
				req.flash('errorMsg', 'Failed to get recipes from Allrecipes.com')
				next(err)
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
// create recipe page
router.get('/create', function(req, res, next) {
	res.render('./recipe/create', { user: req.user });
});

// POST recipe create page
router.post('/create', function(req, res, next) {
	// if either h or m value is 0, don't display/save it
	let duration = '';
	if (req.body.duration_hour > 0) {
		duration += (req.body.duration_hour + ' h ')
	}
	if (req.body.duration_minute > 0) {
		duration += (req.body.duration_minute + ' m')
	}

	// create initial new recipe object
	let newRecipe = new Recipe({
		author: req.user.username, title: req.body.title, category: req.body.category, description: req.body.description,
		duration: duration, serving: req.body.serving,
		source: 'local'
	});

	// if the ingredients value/unit/name is an array/object push to the ingredients list
	if (typeof req.body.ingredients === 'object') {
		req.body.ingredients.forEach(function(ingredient){
			newRecipe.ingredients.push(ingredient);
		})
	}
	else{
		newRecipe.ingredients.push(req.body.ingredients);
	}

	// if the directions is an array, push to the list
	if (typeof req.body.directions === 'object') {
		req.body.directions.forEach(function(direction){
			newRecipe.directions.push(direction);
		})
	}
	else{
		newRecipe.directions.push(req.body.directions);
	}

	// save the recipe and then redirect to the recipe page
	newRecipe.save()
		.then((recipe) => {
		console.log('New recipe created: ', recipe); //debug
		res.redirect('/recipe/recipes/'+ req.body.title)

	})
	.catch((err) => {
		req.flash('errorMsg', 'Error creating recipe');
		next(err);  // Forward error to the error handlers
	});
});



// POST save external recipe
router.post('/save', function(req,res, next) {
	let url = req.body.save_url;
	console.log(url);

	// call for web scraping function with the recipe url url
	ar_scrape(function(err, recipe){
		if (err){
			req.flash('errorMsg', err);
			next(err)
		}
		else {
			// create initial saved recipe object
			let savedRecipe = new Recipe({
				author: recipe.author, title: recipe.title + ' from ' + recipe.source, category: recipe.category, description: recipe.description,
				duration: recipe.duration, serving: recipe.serving, source: recipe.source, saved_by: req.user.username
			});

			// push ingredients
			recipe.ingredients.forEach(function(ingredient){
				savedRecipe.ingredients.push(ingredient);
				// console.log(ingredient)
			});

			// push directions
			recipe.directions.forEach(function(direction){
				// console.log(direction);
				savedRecipe.directions.push(direction)
			});

			// save the recipe and then redirect to the recipe page
			savedRecipe.save()
				.then((recipe) => {
					console.log('Recipe copied: ', recipe); //debug
					res.redirect('/recipe/recipes/'+ savedRecipe.title) // Creates a GET request to

				})
				.catch((err) => {
					req.flash('errorMsg', 'Error saving recipe');
					next(err);  // Forward error to the error handlers
				});
		}
	}, url);

});


// POST publish for publishing the recipe
router.post('/publish/:title', function(req, res, next) {
	let user = req.user;
	Recipe.findOne({title: req.params.title})
		.then( (recipe) => {
			if (user.username === recipe.author || user.username === recipe.saved_by) {  // if user is the author/have saved this recipe
				Recipe.findOneAndUpdate({title: req.params.title}, {published: true})
					.then(()  => {
						res.redirect('/recipe/recipes/'+ req.params.title)
					})
					.catch( (error) => {
						req.flash('errorMsg', error);
						next(error)
					});
			}
			else {  // otherwise, set status to 403
				req.flash('errorMsg', 'You don\'t have the ownership of this recipe!!!');
				res.status(403);
				next()
			}
		})
});

// POST UNpublish for publishing the recipe
router.post('/unpublish/:title', function(req, res, next) {
	let user = req.user;
	Recipe.findOne({title: req.params.title})
		.then( (recipe) => {
			if (user.username === recipe.author || user.username === recipe.saved_by) {  // if user is the author/have saved this recipe
				Recipe.findOneAndUpdate({title: req.params.title}, {published: false})
					.then(()  => {
						res.redirect('/recipe/recipes/'+ req.params.title)
					})
					.catch( (error) => {
						req.flash('errorMsg', error);
						next(error)
					});
			}
			else {  // otherwise, set status to 403
				req.flash('errorMsg', 'You don\'t have the ownership of this recipe!!!');
				res.status(403);
				next()
			}
		})
});

// GET recipe modify page
router.get('/modify/:title', function(req, res, next) {
	let user = req.user;

	Recipe.findOne({title: req.params.title})
		.then( (recipe) => {
			if (user.username === recipe.author) {  // if user is the author
				// separate hour and minute value from the duration into hour and minute to pass onto the modify page
				let duration = recipe.duration;
				let hour = 0;
				let minute = 0;
				if (duration.includes('h')) {
					hour = duration.split('h')[0];
					if (duration.includes('m')) {
						minute = duration.split('h')[1].split('m')[0];
					}
				}
				else {
					minute = duration.split('m')[0];
				}
				res.render('./recipe/modify', {user: user, recipe: recipe, hour: hour, minute: minute})
			}
			else {  // otherwise, set status to 403
				req.flash('errorMsg', 'You don\'t have the ownership of this recipe!!!');
				res.status(403);
				next()
			}
		})
		.catch( (error) => {
			req.flash('errorMsg', error);
			res.redirect('/');
		})
});

// POST recipe modify page
router.post('/modify/:_id', function(req, res, next) {
	let user = req.user;

	// if either h or m value is 0, don't display/save it
	let duration = '';
	if (req.body.duration_hour > 0) {
		duration += (req.body.duration_hour + ' h ')
	}
	if (req.body.duration_minute > 0) {
		duration += (req.body.duration_minute + ' m')
	}

	// create arrays for ingredients and directions
	let ingredients = [];
	// if the ingredients value/unit/name is an array/object push to the ingredients list
	if (typeof req.body.ingredients === 'object') {
		req.body.ingredients.forEach(function(ingredient){
			ingredients.push(ingredient);
		})
	}
	else{
		ingredients.push(req.body.ingredients);
	}

	let directions = [];
	// if the directions is an array, push to the list
	if (typeof req.body.directions === 'object') {
		req.body.directions.forEach(function(direction){
			directions.push(direction);
		})
	}
	else{
		directions.push(req.body.directions);
	}

	// find the recipe with the id and update it with the new values
	Recipe.findOneAndUpdate({_id: req.params._id},
		{title: req.body.title, category: req.body.category, description: req.body.description, duration: duration,
		serving: req.body.serving, ingredients: ingredients, directions: directions})
		.then( (recipe) => {
			res.redirect('/recipe/recipes/' + recipe.title)
		})
		.catch( (error) => {
			req.flash('errorMsg', 'Failed to update the recipe');
			next(error)
		})

});










module.exports = router;
