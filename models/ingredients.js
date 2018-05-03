var mongoose = require('mongoose');

var ingredientsSchema = mongoose.Schema({
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

Ingredient = mongoose.model('Ingredient', ingredientsSchema);

module.exports = Ingredient;