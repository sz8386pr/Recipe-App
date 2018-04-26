var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var ingredientsSchema = mongoose.Schema({
    ingredient: {
        type: String,
        unique: true,
        required: [true, "Can't be blank"],
        index: true
    },
    weight: Number,
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

ingredientsSchema.plugin(uniqueValidator, {message: '{VALUE} is already listed'});

Ingredient = mongoose.model('Ingredient', ingredientsSchema);

module.exports = Ingredient;