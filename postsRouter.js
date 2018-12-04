'use strict'

//Import dependencies
const express = require('express');
const bodyParser = require('body-parser');

//Declare parser for json
const jsonParser = bodyParser.json();

//Import mongoose data models
const { Post } = require('./models');

//Create router instance
const router = express.Router();


//GET route handler for /posts
//-find all posts, sort by title, and send a 'serialized' json response
//-if unsuccessful - send error & display in console
router.get('/', (req, res) => {                                        
    Post.find().sort({title: 1}).then(posts => {
        res.json({posts: posts.map(post => post.serialize())});
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

//GET with ID route handler for /posts
//-find post and send a 'serialized' json response
//-if unsuccesful - send error & display in console
router.get('/:id', (req, res) => {                                    
    Post.findById(req.params.id).then(post => {
        res.json(post.serialize());
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

//POST route handler for /posts
//-validate request body
//-check if author_id exists
//-create post
//-send 'serialized' json response
//-if unsuccesful - send error & display in console
router.post('/', jsonParser, (req, res) => {                                        
    const requiredFields = ['title', 'content', 'author_id'];  
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if(!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message); 
        }
    }

    Author.findById(req.body.author_id).then(author => {
        if (author) {
            Post.create({
                title: req.body.title,
                content: req.body.content,
                author: req.body.author_id
            }).then(post => {
                res.status(201).json(post.serialize());
            }).catch(err => {
                console.error(err);
                res.status(500).json({message: 'Internal server error'});
            });
        } else {
            const message = 'Author not found';
            console.error(message);
            return res.status(400).send(message);
        }
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    })    
});

//PUT route handler for /posts
//-validate request id
//-validate updateable fields
//-update post
//-send a 'serialized' json response
//-if unsuccesful - send error & display in console
router.put('/:id', jsonParser, (req, res) => {                                      
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = `Request path id ${req.params.id} and request body id ${req.body.id} must match`;
        console.error(message);
        return res.status(400).json({message: message});
    }

    const toUpdate = {};
    const updateableFields = ['title', 'content'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    Post.findByIdAndUpdate(req.params.id, { $set: toUpdate }).then(post => {
        res.status(200).json(post.serialize());
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

//DELETE route handler for /posts
//-delete post
//-send a response status of 204
//-if unsuccesful - send error & display in console
router.delete('/:id', (req, res) => {                                  
    Post.findByIdAndRemove(req.params.id).then(post => {
        res.status(204).end();
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

module.exports = router;