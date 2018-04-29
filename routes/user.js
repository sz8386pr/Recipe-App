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


// GET recipe page. Needs to be at the very bottom else other pages below wouldn't be used
router.get('/:username', function(req, res, next) {

	// Find the user with the username
	User.findOne({'username':req.params.username})
		.then( (profile_user) => {
			if (profile_user) {
				// Find recipes that user has created
				Recipe.find({'author': req.params.username}, 'title')
					.then( (titles) => {
						res.render('./user/user', {user: req.user, created_recipes: titles, profile_user: profile_user});
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