const recipe = require('../models/recipe.js');
const Recipe = recipe.Recipe;
const Ingredients = recipe.Ingredients;
const Comment = require('../models/comment.js');
const express = require('express');
const router = express.Router();
const Allrecipes = require('../services/scrape_allrecipes');
const ar_scrape = Allrecipes.scrape;
const ar_get_recipe = Allrecipes.get_recipe;

const Nutritionix = require('../services/api_nutritionix');


function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	}
	else {
		res.redirect('/auth/login')
	}
}

// Middleware to check user login
router.use(isLoggedIn);

// GET recipe page
router.get('/recipes/:title', function(req, res, next) {
	let username = req.user.username;

	// Get recipe with the title and populate nutrition field
	Recipe
		.findOne({'title': req.params.title})
		.populate('nutrition comments')
		.exec( function(err, recipe) {
			if (err) {
				return next(err);
			}

			// sum of total nutrition facts
			let calories = 0;
			let total_fat = 0;
			let saturated_fat = 0;
			let cholesterol = 0;
			let sodium = 0;
			let carb = 0;
			let fiber = 0;
			let sugar = 0;
			let protein = 0;

			let alt_ingredients = [];

			recipe.nutrition.forEach(function(i) {
				calories += i.calories;
				total_fat += i.total_fat;
				saturated_fat += i.saturated_fat;
				cholesterol += i.cholesterol;
				sodium += i.sodium;
				carb += i.carb;
				fiber += i.fiber;
				sugar += i.sugar;
				protein += i.protein;

				alt_ingredients.push({qty: i.quantity, unit: i.unit, weight: i.weight, name: i.name});
			});

			// nf = nutrition facts of sum of nutrition facts for the recipe
			let nf = {calories, total_fat, saturated_fat, cholesterol, sodium, carb, fiber, sugar, protein};
			// console.log(nf);

			// if the user is the owner of the recipe, display the recipe
			if (username === recipe.author || username === recipe.saved_by) {
					res.render('./recipe/recipe', {user: req.user, recipe: recipe, nf: nf, alt_ingredients: alt_ingredients});
			}
			else {
				// otherwise, only display if recipe is published
				if (recipe.published === true) {
					res.render('./recipe/recipe', {user: req.user, recipe: recipe, nf: nf, alt_ingredients: alt_ingredients});
				}
				else {
					req.flash('errorMsg', 'Unauthorized access. This recipe is not published yet');
					res.status(403);
					next()
				}
			}
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

// GET search page
router.get('/search', function(req, res, next) {
	Recipe.find({}, function(err, recipes) {
		if (err) {
			res.redirect('/')
		}
		else {
			res.render('./recipe/search', {user: req.user})
		}
	})
});

// POST search for recipe search
router.post('/search', function(req, res, next) {
	let keyword = req.body.keyword;
	Recipe.find({title: { "$regex": keyword, "$options": "i" }, published: true},null,{ sort: {title: 1} } )
		.then( (recipes) => {
			res.render('./recipe/search', {user: req.user, recipes: recipes, keyword: keyword})
		})
		.catch( (err) => {
			next(err)
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

	get_nutrition(newRecipe);
	// get nutrition facts and save the recipe onto the db
	function get_nutrition(newRecipe) {
		// search without brackets and each ingredients divided with linebreak
		let search = newRecipe.ingredients.join('\n').replace(/\(|\)/g, "");
		Nutritionix(function (err, nutrition) {
			if (err) {
				req.flash('errorMsg', 'Couldn\'t get nutritional information. Check the ingredients');
				res.redirect('/recipe/create')
			}
			else {
				// set the counter for the number of nutrition data gathered
				let nfcounter = nutrition.length;

				// for each nutrition data, save it onto the Ingredients schema and also push the id into the savedRecipe.nutrition
				nutrition.forEach(function(n) {
					let nf = new Ingredients(n);
					nf.save(function(err, nf) {
						if (err) {
							next(err)
						}
						else {
							newRecipe.nutrition.push(nf._id);
							nfcounter--;

							// once all the nutrition facts have been added onto the schema and savedRecipe.nutrition, save savedRecipe onto Recipe schema
							if (nfcounter === 0) {
								newRecipe.save()
									.then( (recipe) => {
										// once it's saved successfully, redirect to the recipe page
										res.redirect('/recipe/recipes/' + recipe.title)
									})
									.catch( (err) => {
										req.flash('errorMsg', 'Error creating recipe');
										next(err)
									})
							}
						}
					});
				});
			}
		}, search);
	}
});

// POST save external recipe
router.post('/save', function(req,res, next) {
	let url = req.body.save_url;
	console.log(url);

	// call for web scraping function with the recipe url
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

			// once function is over, call get_nutrition function and pass savedRecipe object to it
			return get_nutrition(savedRecipe)
		}
	}, url);

	// get nutrition facts and save the recipe onto the db
	function get_nutrition(savedRecipe) {
		// search without brackets and each ingredients divided with linebreak
		let search = savedRecipe.ingredients.join('\n').replace(/\(|\)/g, "");
		Nutritionix(function (err, nutrition) {
			if (err) {
				next(err)
			}
			else {
				// set the counter for the number of nutrition data gathered
				let nfcounter = nutrition.length;

				// for each nutrition data, save it onto the Ingredients schema and also push the id into the savedRecipe.nutrition
				nutrition.forEach(function(n) {
					let nf = new Ingredients(n);
					nf.save(function(err, nf) {
						if (err) {
							next(err)
						}
						else {
							savedRecipe.nutrition.push(nf._id);
							nfcounter--;

							// once all the nutrition facts have been added onto the schema and savedRecipe.nutrition, save savedRecipe onto Recipe schema
							if (nfcounter === 0) {
								savedRecipe.save()
									.then( (recipe) => {
										// once it's saved successfully, redirect to the recipe page
										res.redirect('/recipe/recipes/' + recipe.title)
									})
									.catch( (err) => {
										next(err)
									})
							}
						}
					});
				});
			}
		}, search);
	}
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

// POST comment
router.post('/recipes/:title/comment', function(req, res, next) {
	let newComment = Comment({username: req.body.comment_username, comment: req.body.comment});
	newComment.save()
		.then( (comment) => {
			Recipe.findOneAndUpdate({title: req.params.title}, {$push: {comments: comment._id}}, { upsert: true, sort: {_id: 1} })
				.then( (recipe) => {
					res.redirect('/recipe/recipes/' + recipe.title)
				})
				.catch( (err) => {
					next(err)
				})
		})
		.catch( (err) => {
			next(err)
		});
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
// TODO write more efficient modification method
router.post('/modify/:_id', function(req, res, next) {
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

	// TODO: findOneAndUpdate doesn't return the updated recipe immediately for some reason. Had to set the value manually with findOne() and save() instead to get the correct result
	// console.log(ingredients);
	// // find the recipe with the id and update it with the new values
	// Recipe.findOneAndUpdate({_id: req.params._id}, {"$set": {title: req.body.title, category: req.body.category, description: req.body.description, duration: duration,
	// 	serving: req.body.serving, ingredients: ingredients, directions: directions} })
	// 	.then( (recipe) => {
	// 		console.log(recipe.ingredients);
	// 		return get_nutrition(recipe)
	// 	})
	Recipe.findOne({_id: req.params._id})
		.then( (recipe) => {
			recipe.title = req.body.title; recipe.category = req.body.category; recipe.description = req.body.description;
			recipe.duration = duration;	recipe.serving = req.body.serving; recipe.ingredients = ingredients;
			recipe.directions = directions;
			recipe.save()
				.then( (recipe) => {
					// console.log(recipe.ingredients);
					return get_nutrition(recipe)
				})
		} )
		.catch( (error) => {
				req.flash('errorMsg', 'Failed to update the recipe');
				next(error)
			});

	// get nutrition facts and save the recipe onto the db
	function get_nutrition(savedRecipe) {
		// search without brackets and each ingredients divided with linebreak
		let search = savedRecipe.ingredients.join('\n').replace(/\(|\)/g, "");
		savedRecipe.nutrition = [];  // resets/empties out nutrition list
		// console.log(savedRecipe.ingredients);
		// console.log(savedRecipe.nutrition);
		Nutritionix(function (err, nutrition) {
			if (err) {
				next(err)
			}
			else {
				// set the counter for the number of nutrition data gathered
				let nfcounter = nutrition.length;

				// for each nutrition data, save it onto the Ingredients schema and also push the id into the savedRecipe.nutrition
				nutrition.forEach(function(n) {
					let nf = new Ingredients(n);
					nf.save(function(err, nf) {
						if (err) {
							next(err)
						}
						else {
							savedRecipe.nutrition.push(nf._id);
							// console.log(savedRecipe.nutrition)
							nfcounter--;

							// once all the nutrition facts have been added onto the schema and savedRecipe.nutrition, save savedRecipe onto Recipe schema
							if (nfcounter === 0) {
								savedRecipe.save()
									.then( (recipe) => {
										// once it's saved successfully, redirect to the recipe page
										res.redirect('/recipe/recipes/' + recipe.title)
									})
									.catch( (error) => {
										req.flash('errorMsg', 'Failed to update the Ingredients');
										next(error)
									});
							}
						}
					});
				});
			}
		}, search);
	}
});

// POST delete recipe
router.post('/delete/:_id', function(req, res, next) {
	Recipe.findOneAndRemove({_id: req.params._id})
		.then( (recipe) => {
			Ingredients.remove({_id: {$in: recipe.nutrition}})
				.then( () => {
					req.flash('msg', 'Recipe has been deleted');
					res.redirect('/user/users/' + req.user.username)    // redirect to user profile page
				})
				.catch( (err) => {
					next(err)
				})
		})
		.catch( (err) => {
			next(err)
		});
});


module.exports = router;
