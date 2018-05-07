// Mccha/Chai reference from: https://raw.githubusercontent.com/minneapolis-edu/todo_express_mongoose/master/test/todo_tests.js
// Utility modules

let _ = require('lodash');


// Chai config

let chai = require('chai');
let chaiHTTP = require('chai-http');
let server = require('../app');
let expect = chai.expect;

chai.use(chaiHTTP);


// Database setup

let mongodb = require('mongodb');
let ObjectID = mongodb.ObjectID;

let test_db_url = process.env.MONGO_TEST_URL;


describe('open and empty test db before and close db after', () => {
	let db;
	// collections
	let comments;
	let ingredients;
	let recipes;
	let sessions;
	let users;

	beforeEach('get collections and delete all dos', function(done) {

		mongodb.connect(test_db_url)
			.then( (test_db) => {
				db = test_db;
				// comments = db.collection('comments');
				// ingredients = db.collection('ingredients');
				// recipes = db.collection(' recipes');
				// sessions = db.collection('sessions');
				// users = db.collection('users');
				db.collections().forEach(function(c) {
					if (c !== 'system.indexes') {
						db.collection(c).drop();
					}
				})
			})
	});

	afterEach('close DB connection', (done) => {
		db.close(true)
			.then(() => { return done() })
	});

	describe('signup', function() {

		it('should connect to server', function(done) {
			chai.request(server)
				.get('/')
				.end((err, res) => {
					expect(res).to.have.status(200);
					expect(res.text).to.include('recipe');
					done()
				})
		})

	});


});