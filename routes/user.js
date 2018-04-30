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
	else {
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
				Recipe.findOneAndUpdate({_id: req.params.recipe_id, rating: previous_rating}, {$pull:{rating: previous_rating}})
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





// GET recipe page.
router.get('/users/:username', function(req, res, next) {

	// Find the user with the username
	User.findOne({'username':req.params.username})
		.then( (profile_user) => {
			if (profile_user) {
				// Find recipes that user has created
				Recipe.find({$or: [{'author': req.params.username}, {'saved_by': req.params.username}] })
					.then( (recipes) => {
						// categorize into created/saved recipes
						let created_recipes = [];
						let saved_recipes = [];
						recipes.forEach(function(recipe) {
							if (recipe.source === 'local') {
								created_recipes.push(recipe)
							}
							else {
								saved_recipes.push(recipe)
							}
						});
						res.render('./user/user', {user: req.user, created_recipes: recipes, saved_recipes: saved_recipes, profile_user: profile_user});
					})
					.catch( (error) => {
						req.flash('errorMsg', error);
						next(error)
					})
			}
			else {  // If there is no user with the user name, next to error handler
				req.flash('errorMsg', req.params.username + ' does not exists');
				next()
			}
		})
		.catch( (error) => {
		req.flash('errorMsg', error);
		next(error)
	})
});





module.exports = router;