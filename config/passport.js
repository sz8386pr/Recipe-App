// Code provided by Clara James: https://git.io/vFZ5l
var LocalStrategy = require('passport-local');

var User = require('../models/user');

/*

 Note the done() method, which has various signatures.

 done(app_err, user_err_or_success, messages);
 done(err);

 means there's been a DB or app error - this is not typical.
 Use to indicates issue with DB or infrastructure or something YOU need to fix.

 done(null, false);
 first parameter is for app error - it's null because this is a *user* error.
 Second parameter is false to indicate USER error in login. e.g. wrong password,
 wrong username, trying to sign up with username that already exists...
 Very common issue, your app will decide how to deal with this.

 done(null, false, msg);
 As before, plus msg parameter to provide error message that app may display to user

 done(null, user);
 Success! null=no app error,
 user = new user object created, or authenticated user object

 done(null, user, msg);
 Variation of the previous call. null=no app error,
 user = new user or authenticated user object,
 msg=messages for app to display to user

 */



module.exports = function(passport) {

    /* serializeUser and desrializeUser are related to passport's session setup.
    These provide the ability to serialize the user (save to db)
    and deserialize user (fetch from DB)
     */

    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        })
    });

    // For signing up a new user.

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, username, password, done){

        //https://nodejs.org/api/process.html#process_process_nexttick_callback_arg
        //Once the current event loop turn runs to completion, call the callback function.
        process.nextTick(function(){
			var email = req.body.email;

            //Query DB to see if there is already a user with this username
            User.findOne({ 'username' : username }, function(err, user){
                if (err) { return done(err); }
                if (user) {
                    return done(null, false, req.flash('signupMsg', 'This username is taken'));
                }

                //If no user, create new User, set username, and hash of password
                var newUser = new User();
                newUser.username = username;
                newUser.password = newUser.generateHash(password);
                newUser.email = email; // email value from signup form
                //And save. If no errors, return new User

                newUser.save(function(err){
                    if (err) { return done(err); }
                    return done(null, newUser);
                });
	            // try{
		         //    newUser.save(function(err){
			     //        if (err) { return done(err); }
			     //        return done(null, newUser);
		         //    });
	            // }
	            // catch(error) {
		         //    return done(error)
	            // }

            });
        });
    }));


    // Similar to above, but for logging in users.

    passport.use('local-login', new LocalStrategy({
        usernameField:'username',
        passwordField:'password',
        passReqToCallback: true
    }, function(req, username, password, done) {

        process.nextTick(function(){

            // Find the user with this username in DB
            User.findOne({ 'username':username }, function(err, user){
                if (err) { return done(err); }

                //If user not found, return error message
                if (!user) {
                    return done(null, false, req.flash('loginMsg', 'Username not found'));
                }

                // Check password - this method is defined in User model
                if (!user.validPassword(password)){
                    return done(null, false, req.flash('loginMsg', 'Password incorrect'));
                }

                // If no errors - username and password valid. Return callback with User object
                return done(null, user);
            });
        });
    }));

};