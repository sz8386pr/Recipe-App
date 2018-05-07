#My Recipes
### Page structure
  
    / :                             main page 
    
    /auth/login:                    login page
    /auth/signup                    signup page
    /auth/logout                    logout
    
    /user/<user name>               user porfile page
    /user/<user name>/modify        profile modify  (Owner access)
    /user/<user name>/favorites     user favorites  (Owner access)
    
    /recipe/external-recipes        external recipe search
    /recipe/create                  create new recipe
    /recipe/search                  recipe search page
    /recipe/<recipe name>/          recipe page
    /recipe/<recipe name>/modify    recipe modify page  (Creater access)
    
    functional testing
    http://mherman.org/blog/2015/09/10/testing-node-js-with-mocha-and-chai/