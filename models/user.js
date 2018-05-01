var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var uniqueValidator = require('mongoose-unique-validator');


var userSchema = mongoose.Schema({

    username: {
	    type: String,
	    unique: true,
	    required: [true, "Can't be blank"],
	    match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
	    index: true,
	    uniqueCaseInsensitive: true
    },
    password: {
	    type: String,
	    required: [true, "Can't be blank"]
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, "can't be blank"],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index: true,
	    uniqueCaseInsensitive: true
    },
    sign_up_date : {
        type: Date,
        default: Date.now()
    },
	photo: {
    	type: String,
		default: '/images/default.png'
	},
	favorite: [String],
	rating: [{
    	recipe_id: {
    		type: String,
		    required: true
	    },
		rating: {
    		type: Number,
			min: 1,
			max: 5,
			required: true
		}
	}],
	message: String

});


userSchema.plugin(uniqueValidator, {  message: '{VALUE} is already in use.' });


userSchema.methods.generateHash = function(password) {
    // Generate salted hash of plaintext password
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

userSchema.methods.validPassword = function(password) {

    // Create hash of password entered, compare to stored hash
    // If hashes match, the passwords used to create them were the same.
    return bcrypt.compareSync(password, this.password);
};

User = mongoose.model('User', userSchema);

module.exports = User;