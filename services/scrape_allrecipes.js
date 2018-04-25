const axios = require('axios');
const cheerio = require('cheerio');


// scrape from the specific recipe page
let scrape = async (url) =>
    axios.get(url)
        .then((response) => {
            if(response.status === 200) {
                const html = response.data;
                const $ = cheerio.load(html);

                // Get the recipe category - default "Home" and "Recipes"
                let category = [];
                $('.toggle-similar__title').each(function(){
                    let cat = $(this).text().trim();
                    if (!(cat === 'Home' || cat === 'Recipes')) {
                        category.push(cat);
                    }
                });

                let title = $('.recipe-summary__h1').text().trim(); // Title
                let description = $('.submitter__description').text().trim();   // Author description
                let author = $('.submitter__name').text();  // Author name
                let image = $('img.rec-photo').attr("src"); // Base image
                let duration = $('.ready-in-time').text();  // Recipe duration
                let serving = $('#servings').attr('value'); // Base serving

                // Ingredients
                // TODO: parse to separate unit, measurements, and the ingredient name ie: 2 cup oats
                let ingredients = [];
                $('.added').each(function(){
                    let ingredient = $(this).text();
                    if (ingredient !== "Add all ingredients to list") {
                        ingredient = ingredient.split(' ');
                        let value = ingredient.shift();
                        let unit = ingredient.shift();
                        ingredient = ingredient.join(' ');
                        ingredients.push({value, unit, ingredient});
                    }
                });

                // Recipe directions
                let directions = [];
                $('.recipe-directions__list--item').each(function(){
                    let direction = $(this).text().trim();
                    if (direction !== "") {
                        directions.push(direction);
                    }
                });


                return {
                    title, category, description, author, image, duration, serving, ingredients, directions, source: 'Allrecipes'
                };

            }
        },
    (error) => console.log(error)
);

// finds recipe title/link
function get_recipe(callback, keyword, page) {
	process.nextTick(function(){
		const base_url = 'https://www.allrecipes.com/search/results/?wt=';
		let url = base_url.concat(keyword, '&page=', page);
		console.log(url);
		axios.get(url)
			.then((response) => {
					if(response.status === 200) {
						const html = response.data;
						const $ = cheerio.load(html);

						// get the recipe title & link
						let titles = [];
						$('.fixed-recipe-card__title-link').each(function() {
							let link = $(this).attr('href');
							let title = $(this).text().trim();
							if (link !== undefined) {
								titles.push({'title': title, 'link': link});
							}
						});

						// get the rating and round to 1 decimal place
						let ratings = [];
						$('.fixed-recipe-card__ratings span').each(function() {
							let rating = $(this).attr('data-ratingstars');
							if (rating !== undefined)
							ratings.push({'rating': parseFloat(rating).toFixed(1)})
						});

						// merge the arrays of dictionaries together
						let recipes = [];
						for (var i = 0; titles.length > i; i++){
							recipes.push(Object.assign({}, titles[i], ratings[i]));
						}
						console.log(recipes);   // debug
						callback (null, recipes)
					}
				},
				(error) => callback(error)
			);
	});
}

// // test
// let url1 = 'https://www.allrecipes.com/recipe/255344/3-ingredient-cookies/?internalSource=hub%20recipe&referringContentType=search%20results&clickId=cardslot%202';
// scrape(url1)
//     .then((value) => {
//     console.log(value); // Success!
//     });


module.exports = {
	get_recipe: get_recipe,
	scrape: scrape,
};