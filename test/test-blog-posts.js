'use strict'

//Import dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

//Enable use of 'expect' style syntax
const expect = chai.expect;

//Import models, configuration, & server functions
const { Post } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

//Enables use of chai-http testing methods
chai.use(chaiHttp);

//Create object of random blog post data
function generateBlogPostData() {
    return {
        title: faker.lorem.sentence(),
        content: faker.lorem.text(),
        author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        }
    }
}

//Add 10 randomly generated blog posts to db
function seedBlogPostData() {
    console.info('Seeding blog post data');
    const seedData = [];

    for (let i = 0; i < 10; i++) {
        seedData.push(generateBlogPostData());
    }

    return Post.insertMany(seedData);
}

//Delete entire db
function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Posts API resource', function() {

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return seedBlogPostData();
    });

    afterEach(function () {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    describe('GET endpoint', function() {

        // strategy:
        //    1. get back all posts returned by by GET request to `/posts`
        //    2. prove res has right status, data type
        //    3. prove the number of posts we got back is equal to number in db
        it('Should return all existing blog posts', function() {
            let res;
            return chai.request(app).get('/posts')
                .then(function(_res) {
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.lengthOf.at.least(1);
                    return Post.count();
                })
                .then(function(count) {
                    expect(res.body).to.have.lengthOf(count);
                })
        });

        // strategy: Get back all posts, and ensure they have expected keys
        it('Should return blog posts with right fields', function() {
            let resPost;
            return chai.request(app).get('/posts')
                .then(function(res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.lengthOf.at.least(1);

                    res.body.forEach(function(post) {
                        expect(post).to.be.a('object');
                        expect(post).to.include.keys('id', 'title', 'content', 'author', 'created');
                    });

                    resPost = res.body[0];
                    return Post.findById(resPost.id);
                })
                .then(function(post) {
                    expect(resPost.id).to.equal(post.id);
                    expect(resPost.title).to.equal(post.title);
                    expect(resPost.content).to.equal(post.content);
                    expect(resPost.author).to.equal(post.authorName);
                });
        });
    });

});