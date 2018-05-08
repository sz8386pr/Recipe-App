#Scott's Recipes App
MCTC Capstone/Web Programming Final Project  
Heroku deployment: https://scotts-recipes.herokuapp.com/

## Overview
* Create user's own recipe
    * Can publish to share with the others or un-publish to keep it personally
    * Owners can modify the recipe when it's not published
* Copy the recipe from the other recipe sites (Currently supports Allrecipes.com only)
    * Copier/saver can only decide to publish/un-publish the recipe and cannot modify  
* Users can browse/search published recipes and favorite the recipe / rate the recipe / leave the comment
* User profile can be modified to upload pictures and set a personal message.
    * list of saved / rated recipes is only accessible to the profile owner  
    
## Installation
Setup environment variable. Please refer to environment_variables.txt

MONGO_URL  
X_APP_ID  
X_APP_KEY  
S3_BUCKET_NAME  
AWS_ACCESS_KEY_ID  
AWS_SECRET_ACCESS_KEY  

for testing: MONGO_TEST_URL

## Page Structure
  
    / :                             main page 
    
    /auth/login:                    login page
    /auth/signup                    signup page
    /auth/logout                    logout
    
    /user/users/<user name>         user porfile page
    /user/modify/<user name>        profile modify  (Owner access)
    
    /recipe/all-recipes             displays all recipes for testing purposes
    /recipe/external-recipes/<site> external recipe search
    /recipe/create                  create new recipe
    /recipe/search                  recipe search page
    /recipe/recipes/<recipe name>   recipe page
    /recipe/modify/<recipe name>    recipe modify page  (Creater access)

## App Structure    

    /bin                            Node JS biniry file
    
    /config                         
        -passport.js                    User authentication module
        
    /models                         Schema model folder
        comment.js                      recipe comment model
        recipe.js                       recipe and ingredients model
        uesr.js                         user model
        
    /public
        /images
            -default.png                default user portrait file
        /javascripts                JS folder
            -jquery-3.3.1.min.js        the latest JQuery file (Ended up not using it)
            -modal.js                   used for external recipe modals
            -recipe_create.js           used for creating recipe page
            -recipe_modify.js           used for modify recipe page
            -signup.js                  used for signup page. (PW confirmation)
        /stylesheets                CSS files
            -modal.css                  used for external recipe modals
            -nutrition_facts.css        used for recipe page's nutrition facts
            -sakura-earthly.css         the main css used
            -sakura-vader.css           used temporarily but decided not to
            -style.css                  custom default css
            
    /routes                         
        -auth.js                        user authorization related: login/logout/signup
        -index.js                       started off the base, but only used for the index page now
        -recipe.js                      recipe related: /create/recipe page/modify/delete/rating/comment/
                                            external search/internal search/(un)publish/favorite
        -user.js                        user related: user page/modify/rating/favorite/rate
        
    /services
        -api_nutritionix.js             API module for getting nutrition information for ingredients.
                                            Powered by Nutritionix API
        -scrape_allrecipes.js           For web scraping on Allrecipes.com using Axios and Cheerios
        
    /test
        -fucntiona_test.js              functoinal testing module using Mocha & Chai (work in progress)
        
    /views                          Templates folder
        /auth
            -login.hbs                  login page
            -signup.hbs                 signup page
        /error
            -404_error.hbs              custom 404 error page
            -error.hbs                  custom generic error page
        /partials
            -navigation.hbs             partial top naviagtion template
        /recipe
            -all_recipes.hbs            all the recipes on the db (for developemental purpose)
            -create.hbs                 recipe create template
            -external-search.hbs        selecting the source (Allrecipes.com only for now) 
                                            and entering the search keyword page
            -external_recipes.hbs       external search result and recipe modal  
            -modify.hbs                 recipe modify template
            -search.hbs                 internal recipe search page
        /user
            -modify.hbs                 user profile modify (for portrait/messages...etc)
            -user.hbs                   user profile page template
        -index.hbs                      index page
        -layout.hbs                     layout page for navigation partial/main/css/scripts
        
    -app.js                             main settings file
    -package.json                       list of packages needed for the app
    -package-lock.json                  package 'tracker/log'
    -README.md                          this file
    

## Useful Links    
Functional testing reference: 
http://mherman.org/blog/2015/09/10/testing-node-js-with-mocha-and-chai/  
Nutritionix API (Nutrition info): https://www.nutritionix.com/business/api  
Web scraping info: https://codeburst.io/an-introduction-to-web-scraping-with-node-js-1045b55c63f7  
Modal reference: https://www.w3schools.com/howto/howto_css_modals.asp and http://jsfiddle.net/limeric29/C3LkL/  
Append line with button click: https://plainjs.com/javascript/manipulation/append-or-prepend-to-an-element-29/  
 parentNode.remove() reference: https://stackoverflow.com/questions/46665554/remove-parent-element-on-click-with-plain-javascript  
Sakura CSS: https://github.com/oxalorg/sakura  
Go back to previous page reference: https://stackoverflow.com/questions/12442716/res-redirectback-with-parameters  
Finding key value from the list: https://stackoverflow.com/questions/21538322/check-if-array-has-exact-key-value-object-in-javascript  
Multer/Multer-s3(file upload): https://stackoverflow.com/questions/40494050/uploading-image-to-amazon-s3-using-multer-s3-nodejs  
Multer validation: https://github.com/expressjs/multer/issues/114   
Slider reference: http://thenewcode.com/757/Playing-With-The-HTML5-range-Slider-Input  
print area reference from: https://stackoverflow.com/questions/468881/print-div-id-printarea-div-only  
Nutrition label reference: https://codepen.io/chriscoyier/pen/egHEK   
Handlebar ifCond reference: https://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional  
Drop down navigation reference from: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_dropdown_navbar_click

## Notes
* I like JavaScript
* I hate JavaScript
* Restart WebStorm when dealing with environment variables  
   
![It's Over](public/images/itsover.jpg)