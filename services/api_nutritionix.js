var request = require('request');

// var options = {
//     url: 'https://trackapi.nutritionix.com/v2/natural/nutrients',
//     headers: {
//         'Content-Type': 'application/json',
//         'x-app-id': process.env.X_APP_ID,
//         'x-app-key': process.env.X_APP_KEY,
//         'x-remote-user-id': '0'
//     }
// };
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
        });
    });
}

function parse_json(json_data) {
    let nfs = json_data['foods'][0];

    let ingredient = nfs['food_name'];
    let weight = nfs['serving_weight_grams'] / nfs['serving_qty'];  // to get the single serving weight
    let unit = nfs['serving_unit'];
    let calories = nfs['nf_calories'];
    let total_fat = nfs['nf_total_fat'];
    let saturated_fat = nfs['nf_saturated_fat'];
    let cholesterol = nfs['nf_cholesterol'];
    let sodium = nfs['nf_sodium'];
    let carb = nfs['nf_total_carbohydrate'];
    let fiber = nfs['nf_dietary_fiber'];
    let sugar = nfs['nf_sugars'];
    let protein = nfs['nf_protein'];
    let potassium = nfs['nf_potassium'];

    let measures = [];
    nfs['alt_measures'].forEach(function(item){
        if (item['measure'].includes('cup') || item['measure'].includes('tsp') || item['measure'].includes('tbsp')) {
            measures.push({'unit': item['measure'], 'grams': item['serving_weight']});
        }
    });

    return {
        ingredient, weight, unit, calories, total_fat, saturated_fat, cholesterol, sodium, carb, fiber, sugar, protein,
        potassium, measures
    }
}

// test
get_nutrition(function(err, json){
    if(err) {
        console.log(err)
    }
    else {
        console.log(json)
    }
}, '2 boiled egg');
