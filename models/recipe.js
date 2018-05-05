const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Comment = require('../models/comment.js');



var uniqueValidator = require('mongoose-unique-validator');


var RecipeSchema = mongoose.Schema({
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
	    maxlength: [1024, 'Too many characters'],
	    required: [true, "Can't be blank"]
    },
    author: String,
	saved_by: String,
    image: {
    	type:String,
	    default: '/images/default.png'
    },
    duration: {
        type: String,
	    minlength: [1, 'Enter the time'],
	    maxlength: [32, 'Too many characters'],
	},
    serving: {
    	type: Number,
	    min: [1, 'Serving needs to be greater than 1'],
	    max: [255, 'Are you trying to feed a whole battalion?'],
	    required: [true, 'Needs serving size']
    },
    ingredients: [{
        type: String,
        minlength: [1, 'Enter the ingredient name'],
        maxlength: [255, 'Too many characters'],
        required: [true, 'Needs ingredient name']

    }],
    directions: [{
	    type: String,
	    minlength: [1, 'Enter the direction'],
	    maxlength: [2048, 'Too many characters'],
	    required: [true, 'Needs direction']
    }],
    source: String,
	published: {
    	type: Boolean,
		default: false,
	},
	favorite: {
    	type: Number,
		default: 0,
		min: 0,
		max: 100000
	},
	rating: [{
    	type: Number,
		min: 1,
		max: 5
	}],
	nutrition: [{type: Schema.Types.ObjectId, ref: 'Ingredients'}],
	comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],

});

var IngredientsSchema = mongoose.Schema({
	name: {
		type: String,
		required: [true, "Can't be blank"],
		index: true
	},
	weight: Number,
	quantity: Number,
	unit: String,
	calories: Number,
	total_fat: Number,
	saturated_fat: Number,
	cholesterol: Number,
	sodium: Number,
	carb: Number,
	fiber: Number,
	sugar: Number,
	protein: Number,
	potassium: Number,
	measures:
		[ { unit: String, grams: Number }]
});

RecipeSchema.plugin(uniqueValidator, {message: 'Title "{VALUE}" is already in use.'});

Recipe = mongoose.model('Recipe', RecipeSchema);
Ingredients = mongoose.model('Ingredients', IngredientsSchema);

module.exports = {
	Recipe: Recipe, Ingredients: Ingredients
};