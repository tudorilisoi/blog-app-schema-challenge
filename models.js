'use strict'

//Import mongoose dependency
const mongoose = require('mongoose');

//Declare schmea for mongoose model
const blogPostSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true }
    },
    created: { type: Date, default: Date.now}
});

//Declare virtual property to use for sending data to client
blogPostSchema.virtual('authorName').get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

//Declare method to control data sent to client
blogPostSchema.methods.serialize = function() {
    return {
        title: this.title,
        content: this.content,
        author: this.authorName,
        created: this.created,
        id: this._id  
    };
};

//Declares mongoose model
const Post = mongoose.model('Post', blogPostSchema);

//Export mongoose model
module.exports = { Post };