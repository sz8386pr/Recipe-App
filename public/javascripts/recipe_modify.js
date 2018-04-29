// append line reference https://plainjs.com/javascript/manipulation/append-or-prepend-to-an-element-29/

// additional ingredients input row when user press + button
var ingredient_row = document.createElement('span');
ingredient_row.innerHTML = '<input title="Please enter ingredient." type="text" name="ingredients" maxlength="255" placeholder="ie: minced garlic" required>\n' +
	'                    <button class="minus-ingredient">-</button><br>';

// additional directions input row when user press + button
var directions_row = document.createElement('span');
directions_row.innerHTML = '<input title="Please enter recipe direction." type="text" name="directions" maxlength="255" placeholder="ie: Preheat oven to 350F" required>\n' +
	'                    <button class="minus-directions">-</button><br>';

// additional input row counter
var ingredients_counter = document.querySelectorAll('.minus-ingredient').length + 1;
var directions_counter = document.querySelectorAll('.minus-directions').length + 1;

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
