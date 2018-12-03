'use strict'

//Import mongoose dependency
const mongoose = require('mongoose');

//Declare schema for authors model
const authorSchema = mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, unique: true }
});

//Declare schema for comments model
const commentSchema = mongoose.Schema({
    content: { type: String }
});

//Declare schmea for blog post model
const blogPostSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    created: { type: Date, default: Date.now},
    comments: [commentSchema]
});

//Declare middleware to allow access to authorName virtual property
blogPostSchema.pre('find', function(next) {
    this.populate('author');
    next();
});

blogPostSchema.pre('findOne', function(next) {
    this.populate('author');
    next();
});

//Declare virtual property to use for sending blog post author name data to client
blogPostSchema.virtual('authorName').get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

//Declare virtual property to use for sending author name data to client
authorSchema.virtual('name').get(function() {
    return `${this.firstName} ${this.lastName}`.trim();
});

//Declare method to control blog post data sent to client
blogPostSchema.methods.serialize = function() {
    return {
        title: this.title,
        content: this.content,
        author: this.authorName,
        created: this.created,
        comments: this.comments,
        id: this._id  
    };
};

//Declare method to control author data sent to client
authorSchema.methods.serialize = function() {
    return {
        id: this._id,
        name: this.name,
        userName: this.userName
    };
};

//Declares mongoose model
const Author = mongoose.model('Author', authorSchema);
const Post = mongoose.model('Post', blogPostSchema);

//Export mongoose model
module.exports = { Author, Post };