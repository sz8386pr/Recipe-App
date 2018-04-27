// append line reference https://plainjs.com/javascript/manipulation/append-or-prepend-to-an-element-29/

// additional ingredients input row when user press + button
var ingredient_row = document.createElement('span');
ingredient_row.innerHTML = '<input title="Value must be greater than or equal to 0.1." type="number" name="ingredients_value" step="0.1" min=0.1 max=65535 placeholder="Value" required>\n' +
	'                    <select name="ingredients_unit">\n' +
	'                        <option value="tsp">tsp</option>\n' +
	'                        <option value="tbsp">tbsp</option>\n' +
	'                        <option value="cup">cup</option>\n' +
	'                        <option value="whole">whole</option>\n' +
	'                        <option value="mg">mg</option>\n' +
	'                        <option value="g">g</option>\n' +
	'                        <option value="kg">kg</option>\n' +
	'                        <option value="oz">oz</option>\n' +
	'                        <option value="lb">lb</option>\n' +
	'                        <option value="pint">pint</option>\n' +
	'                        <option value="quart">quart</option>\n' +
	'                        <option value="gallon">gallon</option>\n' +
	'                        <option value="ml">ml</option>\n' +
	'                        <option value="liter">liter</option>\n' +
	'                    </select>\n' +
	'                    <input title="Ingredient name." type="text" name="ingredients_name" maxlength="255" placeholder="ie: minced garlic" required>\n' +
	'                    <button class="minus-ingredient">-</button><br>';

// additional directions input row when user press + button
var directions_row = document.createElement('span');
directions_row.innerHTML = '<input title="Please enter recipe direction." type="text" name="directions" maxlength="255" placeholder="ie: Preheat oven to 350F" required>\n' +
	'                    <button class="minus-directions">-</button><br>';

// additional input row counter
var ingredients_counter = 0;
var directions_counter = 0;

// up to 127 more lines (arbitrary max limit to prevent abuse) of ingredients input row
document.getElementById('add-ingredient').onclick = function() {
	if (ingredients_counter < 127) {
		document.getElementById('additional-ingredient').appendChild(ingredient_row.cloneNode(true));
		ingredients_counter++;
	}
};

// up to 127 more lines (arbitrary max limit to prevent abuse) of directions input row
document.getElementById('add-directions').onclick = function() {
	if (directions_counter < 127) {
		document.getElementById('additional-directions').appendChild(directions_row.cloneNode(true));
		directions_counter++;
	}
};
