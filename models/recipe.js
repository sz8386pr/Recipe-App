var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var recipeSchema = mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: [true, "Can't be blank"],
        index: true
    },
    category: [String],
    description: String,
    author: String,
    image: String,
    duration: String,
    serving: Number,
    ingredients: [{value: Number, unit: String, ingredient: String}]
    directions: [String],
    source: String
});

recipeSchema.plugin(uniqueValidator, {message: 'is already taken.'});

Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;