var request = require('request');


function get_nutrition(callback, ingredient) {

    process.nextTick(function(){

        request.post({
            uri:     "https://trackapi.nutritionix.com/v2/natural/nutrients",
            headers: {
                "Content-Type": "application/json",
                "x-app-id": process.env.X_APP_ID,
                "x-app-key": process.env.X_APP_KEY,
                "x-remote-user-id": "0"
            },
            body:  {query: ingredient},
            json: true
        },
        function(error, response, body){
            if (!error && response.statusCode == 200) {
                try {
                    let json_parsed = parse_json(body);
                    callback(null, json_parsed)
                }
                catch (error) {
                    callback(error);
                }
            }
            else {
                callback(Error('Error fetching data from Nutritionix API'), error);
            }
        });
    });
}

function parse_json(json_data) {
    let nfs = json_data['foods'];

	let nutrition_facts = [];

    nfs.forEach(function(i) {
	    let measures = [];
	    i['alt_measures'].forEach(function(item){
		    if (item['measure'].includes('cup') || item['measure'].includes('tsp') || item['measure'].includes('tbsp')) {
			    measures.push({'unit': item['measure'], 'grams': item['serving_weight']});
		    }
	    });
		nutrition_facts.push({
			name: i['food_name'], weight: i['serving_weight_grams'], quantity: i['serving_qty'], unit: i['serving_unit'],
			calories: i['calories'], total_fat: i['nf_total_fat'], saturated_fat: i['nf_saturated_fat'],
			cholesterol: i['nf_cholesterol'], sodium: i['nf_sodium'], carb: i['nf_total_carbohydrate'],
			fiber: i['nf_dietary_fiber'], sugar: i['nf_sugars'], protein: i['nf_protein'], potassium: i['nf_potassium'],
			measures: measures
		})
    });
    // JSON.stringify(nutrition_facts);
    return nutrition_facts
}

// // test
// get_nutrition(function(err, json){
//     if(err) {
//         console.log(err)
//     }
//     else {
//         console.log(json)
//     }
// }, '1 egg, half bacon slice');


module.exports = get_nutrition;