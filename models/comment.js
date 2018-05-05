const mongoose = require('mongoose');

var CommentSchema = mongoose.Schema({
	username: {
		type: String,
		required: [true, "Can't be blank"],
	},
	comment: [{
		type: String,
		minlength: [1, 'Enter the category'],
		maxlength: [500, 'Too many characters'],
		required: [true, "Can't be blank"]
	}]
});

let Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;