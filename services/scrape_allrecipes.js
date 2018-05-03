const axios = require('axios');
const cheerio = require('cheerio');


// scrape from the specific recipe page
function scrape(callback, url) {
	process.nextTick(function(){
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
					category = category.join(' > ');  // join into a single string joined by >


					let title = $('.recipe-summary__h1').text().trim(); // Title
					let description = $('.submitter__description').text().trim();   // Author description
					let author = $('.submitter__name').text();  // Author name
					let image = $('img.rec-photo').attr("src"); // Base image
					let duration = $('.prepTime__item:nth-child(4) time').text();  // Recipe duration
					// console.log(duration)

					let serving = $('#servings').attr('value'); // Base serving

					// Ingredients
					// TODO: parse to separate unit, measurements, and the ingredient name ie: 2 cup oats
					let ingredients = [];
					$('.added').each(function(){
						let ingredient = $(this).text().trim();
						if (ingredient !== "Add all ingredients to list") {
							// 	ingredient = ingredient.split(' ');
							// 	let value = ingredient.shift();
							// 	let unit = ingredient.shift();
							// 	let name = ingredient.join(' ');
							// 	console.log(value)
							ingredients.push(ingredient);
						}

					});
					// console.log(ingredients)
					// Recipe directions
					let directions = [];
					$('.recipe-directions__list--item').each(function(){
						let direction = $(this).text().trim();
						if (direction !== "") {
							directions.push(direction);
						}
					});
					// console.log(directions)
					let recipe = {title, category, description, author, image, duration, serving,
						ingredients, directions, 'source': 'Allrecipes.com'
					};
					callback (null, recipe);
				}
			},
			(error) => callback(error)
		)
	});
}

// finds recipe title/link
function get_recipe(callback, keyword, page) {
	process.nextTick(function(){
		const base_url = 'https://www.allrecipes.com/search/results/?wt=';
		let url = base_url.concat(keyword, '&page=', page);
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

					// TODO: because number of reviews is displayed using js/jquery, data gathered with Axios doesn't contain information
					// // number of reviews
					// let reviews = [];
					// $('.fixed-recipe-card__reviews').each(function() {
					// 	let review = $(this).text();
					// 	reviews.push({'reviews': review})
					// });
					//
					// // merge the arrays of dictionaries together
					// let recipes = [];
					// for (var i = 0; titles.length > i; i++){
					// 	recipes.push(Object.assign({}, titles[i], ratings[i], reviews[i]));
					// }
					// console.log(recipes);   // debug
					callback (null, recipes)
				}
			},
			(error) => callback(error)
		);
	});
}

module.exports = {
	get_recipe: get_recipe,
	scrape: scrape,
};