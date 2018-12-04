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

//Import app configuration
const { PORT, DATABASE_URL } = require('./config');   


//Import routers
const postsRouter = require('./postsRouter');
const authorsRouter = require('./authorsRouter');

//Create app instance
const app = express();                                

//Middleware
//-request logging
//-serve static assets from 'public' folder
//-routers
app.use(morgan('common'));                             
app.use(express.static('public'));                                                       
app.use('/posts', postsRouter);
app.use('/authors', authorsRouter);

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