var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var recipeSchema = mongoose.Schema({
    title: {
        type: String,
	    minlength: [1, 'Enter the title'],
	    maxlength: [255, 'Too many characters'],
        unique: true,
        required: [true, "Can't be blank"],
        index: true
    },
    category: [{
    	type: String,
	    default: 'Recipe',
	    minlength: [1, 'Enter the category'],
	    maxlength: [255, 'Too many characters'],
	    required: [true, "Can't be blank"]
	}],
    description: {
    	type: String,
	    default: 'Recipe',
	    minlength: [1, 'Enter the description'],
	    maxlength: [255, 'Too many characters'],
	    required: [true, "Can't be blank"]
    },
    author: String,
    image: String,
    duration: {
    	value: {
    		type: Number,
		    min: [0, 'Enter greater than 0'],
		    max: [65535, 'Way too big'],
		    required: [true, 'Needs duration']
	    },
	    unit: {
    		type: String,
		    required: [true, 'Needs duration unit']
	    }
    },
    serving: {
    	type: Number,
	    min: [1, 'Serving needs to be greater than 1'],
	    max: [255, 'Are you trying to feed a whole battalion?'],
	    required: [true, 'Needs serving size']
    },
    ingredients: [{
        value: {
            type: Number,
	        min: [0, 'Enter greater than 0'],
	        max: [65535, 'Way too big'],
	        required: [true, 'Needs unit value']
        },
        unit: {
            type: String,
	        minlength: [1, 'Enter the unit'],
	        maxlength: [20, 'Too many characters'],
	        required: [true, 'Needs unit of measurement']
        },
        name: {
            type: String,
	        minlength: [1, 'Enter the ingredient name'],
	        maxlength: [255, 'Too many characters'],
	        required: [true, 'Needs ingredient name']
        }
    }],
    directions: [{
	    type: String,
	    minlength: [1, 'Enter the direction'],
	    maxlength: [255, 'Too many characters'],
	    required: [true, 'Needs direction']
    }],
    source: String
});

recipeSchema.plugin(uniqueValidator, {message: '{VALUE} is already in use.'});

Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;