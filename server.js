'use strict'

//Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');

//Declare parser for json
const jsonParser = bodyParser.json();

//Configure mongoose to use ES6 promises
mongoose.Promise = global.Promise;                     

//Import app configuration & mongoose model
const { PORT, DATABASE_URL } = require('./config');   
const { Author, Post } = require('./models');                  

//Create app instance
const app = express();                                

//Middleware
//-request logging
//-serve static assets from 'public' folder
//-parse json requests
app.use(morgan('common'));                             
app.use(express.static('public'));                     
app.use(jsonParser);                                   


//GET route handler
app.get('/posts', (req, res) => {                                        
    Post.find().sort({title: 1}).then(posts => {
        res.json({posts: posts.map(post => post.serialize())});
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

//GET with ID route handler
app.get('/posts/:id', (req, res) => {                                    
    Post.findById(req.params.id).then(post => {
        res.json(post.serialize());
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

//POST route handler
app.post('/posts', (req, res) => {                                        
    const requiredFields = ['title', 'content', 'author'];  
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if(!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message); 
        }
    }
            
    Post.create({
                title: req.body.title,
                content: req.body.content,
                author: req.body.author
            }).then(post => {
                res.status(201).json(post.serialize());
            }).catch(err => {
                console.error(err);
                res.status(500).json({message: 'Internal server error'});
            });
       
    
});

//PUT by ID route handler
app.put('/posts/:id', (req, res) => {                                      
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = `Request path id ${req.params.id} and request body id ${req.body.id} must match`;
        console.error(message);
        return res.status(400).json({message: message});
    }

    const toUpdate = {};
    const updateableFields = ['title', 'content', 'author'];

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

//DELETE by ID route handler
app.delete('/posts/:id', (req, res) => {                                  
    Post.findByIdAndRemove(req.params.id).then(post => {
        res.status(204).end();
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

//Catch all handler if route does not exist
app.use('*', (req, res) => {                      
    res.status(404).json({message: "Not Found"});
});

//Declare global server object for runServer & closeServer functions
let server;

//Run server
function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
      mongoose.connect(
        databaseUrl, { useNewUrlParser: true },
        err => {
          if (err) {
            return reject(err);
          }
          server = app
            .listen(port, () => {
              console.log(`Your app is listening on port ${port}`);
              resolve();
            })
            .on("error", err => {
              mongoose.disconnect();
              reject(err);
            });
        }
      );
    });
}

//Close server
function closeServer() {
    return mongoose.disconnect().then(() => {
      return new Promise((resolve, reject) => {
        console.log("Closing server");
        server.close(err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
}

//Calls runServer if requested by 'node server.js'
//can be called separatley if imported somewhere else
if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

//Export app instance & runServer/closeServer functions
module.exports = { app, runServer, closeServer };