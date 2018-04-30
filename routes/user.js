var express = require('express');
var router = express.Router();
var Recipe = require('../models/recipe.js');
var User = require('../models/user.js');





function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	}
	else {
		res.redirect('/auth/login')
	}
}

router.use(isLoggedIn);

// POST favorite
router.post('/favorite/:recipe_id', function(req, res, next) {
	// if favorites value is favorite, add to favorite
	if (req.body.favorite === 'favorite') {
		// Check if the recipe has been favorited
		User.findOne({ 'username' : req.user.username })
			.then( (user) => {
				if (user.favorite.indexOf(req.params.recipe_id) > -1) {
					req.flash('errorMsg', 'You already have favorited it');
					let backURL=req.header('Referer') || '/';
					return res.redirect(backURL);  // Redirect to the previous recipe page
				}
				// If isn't not found, add to user's favorite and increase recipe's favorite counter by 1
				else {
					User.findOneAndUpdate( {'username': req.user.username}, { $push: {favorite: req.params.recipe_id} })
						.then( (user) => {
						})
						.catch( (error) => {
							next(error)
						});
					Recipe.findOneAndUpdate( {_id: req.params.recipe_id}, { $inc: {favorite: 1} } )
						.then( (recipe) => {
							res.redirect('/recipe/recipes/' + recipe.title)
						})
						.catch( (error) => {
							next(error)
						});
				}
			})
			.catch( (error) => {
				next(error)
			});
	}
	else if (req.body.favorite === 'unfavorite') {
		// Check if the recipe has been favorited
		User.findOne({ 'username' : req.user.username })
			.then( (user) => {
				// If it's found, remove from user's favorite and decrease recipe's favorite counter by 1
				if (user.favorite.indexOf(req.params.recipe_id) > -1) {
					User.findOneAndUpdate( {'username': req.user.username}, { $pull: {favorite: req.params.recipe_id} })
						.then( (user) => {
						})
						.catch( (error) => {
							next(error)
						});
					Recipe.findOneAndUpdate( {_id: req.params.recipe_id}, { $inc: {favorite: -1} } )
						.then( (recipe) => {
							res.redirect('/recipe/recipes/' + recipe.title)
						})
						.catch( (error) => {
							next(error)
						});
				}
				// If it's not found, go back and display error mesaage
				else {
					req.flash('errorMsg', 'It is not favorited yet');
					let backURL=req.header('Referer') || '/';
					return res.redirect(backURL);  // Redirect to the previous recipe page
				}
			})
			.catch( (error) => {
				next(error)
			});
	}
});

// POST rating
router.post('/rate/:recipe_id', function(req, res, next) {

	User.findOne({username: req.user.username})
		.then( (user) => {
			// Check if user have rated it. Reference for some(): https://stackoverflow.com/questions/21538322/check-if-array-has-exact-key-value-object-in-javascript
			let recipe_rated = user.rating.some(function(o){return o["recipe_id"] === req.params.recipe_id;});
			if (recipe_rated) { // If recipe_id exists in rating/has been rated, update the rating

				// Get the previous rating for this recipe
				let previous_rating = user.rating.find(function(o){return o["recipe_id"] === req.params.recipe_id;}).rating;
				console.log(previous_rating);

				// Update with the new rating for the user side
				User.findOneAndUpdate({'rating.recipe_id': req.params.recipe_id, username: req.user.username}, {'$set':  {'rating.$.rating': req.body.rating}})
					.then( (user) => {
					})
					.catch( (error) => {
						next(error)
					});
				// Delete the previous rating on the recipe side. Note: it doesn't have to be the exact index that user rated as long as it finds and delete one rating that matches the previous rating
				Recipe.findOneAndUpdate({_id: req.params.recipe_id}, {$pop:{rating: previous_rating}})
					.then( (recipe) => {
						// console.log(recipe)
					})
					.catch( (error) => {
						next(error)
					});
				// And push a new rating on the recipe side
				Recipe.findOneAndUpdate({_id: req.params.recipe_id}, {$push:{rating: req.body.rating}})
					.then( (recipe) => {
						res.redirect('/recipe/recipes/' + recipe.title)
					})
					.catch( (error) => {
						next(error)
					});
			}
			// If this recipe hasn't been rated
			else {
				// Push this recipe id and rating pair
				User.findOneAndUpdate({username: req.user.username}, {'$push': {rating: {recipe_id: req.params.recipe_id, rating: req.body.rating}}})
					.then( (user) => {
					})
					.catch( (error) => {
						next(error)
					});
				// Push the new rating on the recipe side
				Recipe.findOneAndUpdate({_id: req.params.recipe_id}, {$push:{rating: req.body.rating}})
					.then( (recipe) => {
						res.redirect('/recipe/recipes/' + recipe.title)
					})
					.catch( (error) => {
						next(error)
					});
			}
		})
		.catch( (error) => {
			next(error)
		});

});


// GET profile modify page
router.get('/modify/:username', function(req, res, next) {
	// Check if the user is the owner of the modify page
	let username = req.user.username;
	console.log(username);
	if (username === req.params.username) {
		res.render('./user/modify', {user: req.user})
	}
	else {
		req.flash('errorMsg', 'You don\'t have the right permission to access this page');
		res.status(403);
		next();
	}
});

// POST profile modify page
router.post('/modify/:username', function(req, res, next) {
	// Check if the user is the owner of the modify page
	if (req.user.username === req.params.username) {
		User.findOneAndUpdate({username: req.params.username}, {message: req.body.message, email: req.body.email, photo: req.body.photo})
			.then ( () => {
				res.redirect('/user/users/' + req.user.username)
			})
			.catch( (error) => {
				req.flash('errorMsg', 'Failed to modify profile');
				next(error)
			});
	}
	else {
		req.flash('errorMsg', 'You don\'t have the right permission to access this page');
		res.status(403);
		next();
	}
});

// GET recipe page.
router.get('/users/:username', function(req, res, next) {
	// categorize into created/saved recipes
	let created_recipes = [];
	let saved_recipes = [];
	// Create favorite/rated recipe list
	let favorite_recipes;
	let rated_recipes = [];

	// Find the user with the username
	User.findOne({username: req.params.username})
		.then( (profile_user) =>{

			// Find recipes that user has created/saved and push onto the appropriate list
			Recipe.find({$or: [{'author': req.params.username}, {'saved_by': req.params.username}] })
				.then( (recipes) => {
					recipes.forEach(function(recipe) {
						if (recipe.source === 'local') {
							created_recipes.push(recipe)
						}
						else {
							saved_recipes.push(recipe)
						}
					});

					// If user is not the profile owner, display without favorite/rated recipes
					if (req.user.username !== profile_user.username) {
						res.render('./user/user', {user: req.user, created_recipes: created_recipes, saved_recipes: saved_recipes, profile_user: profile_user});
					}
					// If user is the profile owner, get favorite/rated recipes and display them as well
					else {
						Recipe.find({_id: profile_user.favorite}, 'title')
							.then( (recipes) => {
								favorite_recipes = (recipes);

								// extract recipe_id  to find the recipes with the matching id
								let rated_recipe_ids = profile_user.rating.map(x => x.recipe_id);
								// console.log(rated_recipe_ids); //debug
								Recipe.find({_id: rated_recipe_ids})
									.then( (recipes) => {

										// Find the title of the recipe with the matching id from the user's rating data and pair it with the rating
										profile_user.rating.forEach(function(r){
											let title = recipes.find(function(e) {return e._id == r.recipe_id}).title;
											let rating = r.rating;
											rated_recipes.push({title, rating})
										});
										// console.log(rated_recipes); //debug

										// render profile page with the favorite_recipes and rated_recipes as well
										res.render('./user/user', {user: req.user, created_recipes: created_recipes, saved_recipes: saved_recipes, profile_user: profile_user, favorite_recipes: favorite_recipes, rated_recipes: rated_recipes})
									})
									.catch( (error) => {
										req.flash('errorMsg', error);
										next(error)
									});
							});
					}
				})
				.catch( (error) => {
					req.flash('errorMsg', error);
					next(error)
				});
		})
		.catch( (error) => {
			req.flash('errorMsg', error);
			next()
		})
});

module.exports = router;