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
router.get('/', (req, res) => {                                        
    Post.find().sort({title: 1}).then(posts => {
        res.json({posts: posts.map(post => post.serialize())});
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

//GET with ID route handler for /posts
router.get('/:id', (req, res) => {                                    
    Post.findById(req.params.id).then(post => {
        res.json(post.serialize());
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

//POST route handler for /posts
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

//PUT by ID route handler for /posts
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

//DELETE by ID route handler for /posts
router.delete('/:id', (req, res) => {                                  
    Post.findByIdAndRemove(req.params.id).then(post => {
        res.status(204).end();
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

module.exports = router;