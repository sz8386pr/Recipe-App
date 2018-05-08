// Database setup.

// Create a separate test database at mLab.

// Overwrite the database URL with the test database.

let db_config = require('../config/db_config');
let test_db_url = process.env.MONGO_TEST_URL;  // Verify that this environment variable is configured on your computer
db_config.db_url = test_db_url;

const TEST_DB_NAME = 'recipe-test';   // TODO change this if your database name is different

let mongodb_client = require('mongodb').MongoClient;
const recipe = require('../models/recipe.js');
const Recipe = recipe.Recipe;
const Ingredients = recipe.Ingredients;
const Comment = require('../models/comment.js');
const User = require('../models/user.js');

// Chai config
let chai = require('chai');
let chaiHTTP = require('chai-http');
let server = require('../app');
let expect = chai.expect;

let chaiHtml = require('chai-html');

chai.use(chaiHTTP);
chai.use(chaiHtml);

// Cookie server remembers cookies, needed to test flash messages. chai_server does not.
let cookie_server = chai.request.agent(server);
let chai_server =  chai.request(server);


// Tests!

describe('empty test db before tests, and and close db after ', () => {
	let test_db_client;
	// collections
	let comments;
	let ingredients;
	let recipes;
	let sessions;
	let users;

	before('get collections and delete all dos', function(done) {

		mongodb_client.connect(test_db_url)
			.then((client) => {
				test_db_client = client;
				comments = test_db_client.db(TEST_DB_NAME).collection('comments');
				ingredients = test_db_client.db(TEST_DB_NAME).collection('ingredients');
				recipes = test_db_client.db(TEST_DB_NAME).collection('recipes');
				sessions = test_db_client.db(TEST_DB_NAME).collection('sessions');
				users = test_db_client.db(TEST_DB_NAME).collection('users');

				comments.deleteMany({}).then( ()=> {
				});
				ingredients.deleteMany({}).then( ()=> {
				});
				recipes.deleteMany({}).then( ()=> {
				});
				sessions.deleteMany({}).then( ()=> {
				});
				users.deleteMany({}).then( ()=> {
					done()
				});
			})
	});

	beforeEach('connect to the test db server', function(done) {

		mongodb_client.connect(test_db_url)
			.then((client) => {
				test_db_client = client;
				done()
			});
	});

	afterEach('close DB connection', (done) => {
		test_db_client.close(true)
			.then(() => { done() })
	});

	describe('signup/login test', function() {

		it('should be able to connect to server', function(done) {
			chai_server
				.get('/')
				.end((err, res) => {
					expect(res).to.have.status(200);
					expect(res.text).to.include('Default index page here');
					done()
				})
		});

		it('should be able to create account', function(done) {
			this.timeout(5000);     // on rare occasion this task takes little longer than the default timeout--2000ms. Presumably due to the delay to connect to mLab
			cookie_server
				.post('/auth/signup/')
				.send({username: 'testuser', password: 'testuser', confirm_password: 'testuser', email: 'testuser@email.com'})
				.end((err, res) => {
					expect(res.status).to.equal(200);

					users.find().toArray().then( (users) => {
						expect(users.length).to.equal(1);
						var user = users[0];
						expect(user).to.have.property('username').equal('testuser');
						expect(user).to.have.property('email').equal('testuser@email.com');
						expect(res.text).to.include('Default index page here');

						done();
					})
				})

		});

		it('should NOT be able to login with a wrong username', function(done) {
			cookie_server
				.post('/auth/login')
				.send({username: 'badusername', password: 'testuser'})
				.end((err, res) => {
					expect(res.status).to.equal(200);
					expect(res.text).to.include('Username not found');
					done();
				})
		});

		it('should NOT be able to login with a wrong password', function(done) {
			cookie_server
				.post('/auth/login')
				.send({username: 'testuser', password: 'badpassword'})
				.end((err, res) => {
					expect(res.status).to.equal(200);
					expect(res.text).to.include('Password incorrect');
					done();
				})
		});

		it('should be able to login with the right combination', function(done) {
			cookie_server
				.post('/auth/login')
				.send({username: 'testuser', password: 'testuser'})
				.end((err, res) => {
					expect(res.status).to.equal(200);
					expect(res.text).to.include('Default index page here');
					done();
				})
		})
	});


	describe('external search test', function() {

		it('should be able to open external search page', function(done) {
			cookie_server
				.get('/recipe/external-search')
				.end((err, res) => {
					expect(res.status).to.equal(200);
					expect(res.text).to.include('Search recipes from other sources');
					done();
				})
		});

		it('should be able to search Allrecipes with keyword chicken', function(done) {
			this.timeout(5000);     // on rare occasion this task takes little longer than the default timeout--2000ms. Presumably due to the delay to connect to mLab
			cookie_server
				.post('/recipe/external-search/allrecipes')
				.send({site: 'allrecipes', keyword: 'chicken'})
				.end((err, res) => {
					expect(res.status).to.equal(200);
					expect(res.text).to.include('Search result for' && 'CHICKEN' && 'ALLRECIPES');
					done()
				})
		});

		it('should be able to save chicken-parmasan recipe from ALLrecipes', function(done) {
			this.timeout(10000);     // this task takes longer than the default timeout--2000ms
			cookie_server
				.post('/recipe/save')
				.send({save_url: 'https://www.allrecipes.com/recipe/223042/chicken-parmesan/'})
				.end((err, res) => {
					expect(res.status).to.equal(200);
					expect(res.text).to.include('Chicken Parmesan from Allrecipes.com');
					done()
				})
		})
	});


	describe('create recipe test', function() {

		it('should render create recipe page', function(done) {
			cookie_server
				.get('/recipe/create')
				.end((err, res) => {
					expect(res.status).to.equal(200);
					expect(res.text).to.include('Create Recipe');
					done()
				})
		});

		it('should be able to create a new recipe', function(done) {
			cookie_server
				.post('/recipe/create')
				.send({title:'test recipe', category: 'test category', description: 'test desc', duration_hour: 1,
						duration_minute: 0, serving: 5, ingredients: 'chicken', directions: 'chop chop'})
				.end((err, res) => {
					expect(res.status).to.equal(200);
					expect(res.text).to.include('test recipe' && 'chop chop');
					recipes.find().toArray().then( (recipes) => {
						expect(recipes.length).to.equal(2);
						var recipe = recipes[1];
						expect(recipe).to.have.property('title').equal('test recipe');
						done();
					});
				})
		})
	});


	describe('internal search & publish function test', function() {

		it('should not find anything on search because nothing was published', function(done) {
			cookie_server
				.post('/recipe/search')
				.send({keyword: 'recipe'})
				.end((err, res) => {
					expect(res.status).to.equal(200);
					expect(res.text).to.include('There are no recipes that matches');
					recipes.find().toArray().then( (recipes) => {
						expect(recipes.length).to.equal(2);
						var recipe = recipes[1];
						expect(recipe).to.have.property('title').equal('test recipe');
						expect(recipe).to.have.property('published').equal(false);  // recipes created have published on false by default
						done();
					});
				})
		});

		it('publish test recipe', function(done) {
			cookie_server
				.post('/recipe/publish/test recipe')
				.end((err, res) => {
					expect(res.status).to.equal(200);
					recipes.find().toArray().then( (recipes) => {
						expect(recipes.length).to.equal(2);
						var recipe = recipes[1];
						expect(recipe).to.have.property('title').equal('test recipe');
						expect(recipe).to.have.property('published').equal(true);   // it is published now
						done();
					});
				})
		});

		it('should display test recipe on search result this time', function(done) {
			this.timeout(5000);     // on rare occasion this task takes little longer than the default timeout--2000ms. Presumably due to the delay to connect to mLab
			cookie_server
				.post('/recipe/search')
				.send({keyword: 'test recipe'})
				.end((err, res) => {
					expect(res.status).to.equal(200);
					expect(res.text).to.include('test recipe' && 'by testuser');    // asset that search finds published recipes
					done()
				})
		})
	})
});