'use strict'

//Import dependencies
const express = require('express');
const bodyParser = require('body-parser');

//Declare parser for json
const jsonParser = bodyParser.json();

//Import mongoose data models
const { Author } = require('./models');

//Create router instance
const router = express.Router();

//GET route handler for /authors
router.get('/', (req, res) => {
    Author.find().sort({name: 1}).then(authors => {
        res.json({authors: authors.map(author => author.serialize())});
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

//POST route handler for /authors
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['firstName', 'lastName', 'userName'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if(!(field in req.body)) {
            const message = `Missing ${field} in req.body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Author.findOne({userName: req.body.userName}).then(author => {
        if (author) {
            const message = 'Username already taken';
            console.error(message);
            return res.status(400).send(message);
        } else {
            Author.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                userName: req.body.userName
            }).then(author =>{
                res.status(201).json(author.serialize());
            }).catch(err => {
                console.error(err);
                res.status(500).json({message: 'Internal server error'});
            });
        }
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

//PUT request handler for /authors
router.put('/:id', jsonParser, (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = `Request path id ${req.params.id} and request body id ${req.body.id} must match`;
        console.error(message);
        res.status(400).json({message: message});
    }

    const toUpdate = {};
    const updateableFields = ['firstName', 'lastName', 'userName'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    Author.findOne({userName: toUpdate.userName || '', _id: { $ne: req.params.id }}).then(author => {
        if (author) {
            const message = 'Username already taken';
            console.error(message);
            return res.status(400).send(message);
        } else {
            Author.findByIdAndUpdate(req.params.id, { $set: toUpdate}).then(author => {
                res.status(200).json(author.serialize());
            }).catch(err => {
                console.error(err);
                res.status(500).json({message: 'Internal server error'});
            });
        }
    });
});

//DELETE request handler for /authors
router.delete('/:id', (req, res) => {
    Post.remove({author: req.params.id}).then(() => {
        Author.findByIdAndRemove(req.params.id).then(author => {
            console.log(`Deleted blog posts owned by and author with id ${req.params.id}`);
            res.status(204).json({message: 'Success!'});
        });
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

module.exports = router;