'use strict'

//Import dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

//Enable use of 'expect' style syntax
const expect = chai.expect;

//Import models, configuration, & server functions
const { Post, Author } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { deleteCollections } = require('../test-helpers')


//Enables use of chai-http testing methods
chai.use(chaiHttp);

//Create object of random blog post data
function generateBlogPostData(authorID) {
    return {
        title: faker.lorem.sentence(),
        content: faker.lorem.text(),
        author:authorID,
    }

}

let author
const generateAuthors = async () => {
    // await deleteCollections('authors')
    const data = {
        userName: 'Tudor',
        firstName: 'Tudor',
        lastName: 'Ilisoi',
    }
    author = await Author.create(data)
    return author
}

//Add 10 randomly generated blog posts to db
async function seedBlogPostData() {
    console.info('Seeding blog post data');
    const seedData = [];
    const author = await generateAuthors()


    for (let i = 0; i < 10; i++) {
        const values = generateBlogPostData(author._id)
        seedData.push(values);
    }

    //CPU RAM
    const ids = await Post.insertMany(seedData);

}

//Delete entire db
function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Posts API resource', function () {

    before(async function () {

        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(async function () {
        await tearDownDb();
        return seedBlogPostData();
    });

    afterEach(function () {

    });

    after(function () {
        return closeServer();
    });

    describe('GET endpoint', function () {

        // strategy:
        //    1. get back all posts returned by by GET request to `/posts`
        //    2. prove res has right status, data type
        //    3. prove the number of posts we got back is equal to number in db
        it('Should return all existing blog posts', async function () {
            const res = await chai.request(app).get('/posts')
            const { posts } = res.body

            expect(res).to.have.status(200);
            // expect(posts).to.have.lengthOf.at.least(1);
            const postsCount = await  Post.count();
            expect(posts).to.have.lengthOf(postsCount);

        });

        // strategy: Get back all posts, and ensure they have expected keys
        it('Should return blog posts with right fields', function () {
            let resPost;
            return chai.request(app).get('/posts')
                .then(function (res) {
                    const { posts } = res.body
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(posts).to.be.a('array');
                    expect(posts).to.have.lengthOf.at.least(1);

                    posts.forEach(function (post) {
                        expect(post).to.be.a('object');
                        expect(post).to.include.keys('id', 'title', 'content', 'author', 'created');
                    });

                    resPost = posts[0];
                    return Post.findById(resPost.id);
                })
                .then(function (post) {
                    expect(resPost.id).to.equal(post.id);
                    expect(resPost.title).to.equal(post.title);
                    expect(resPost.content).to.equal(post.content);
                    expect(resPost.author).to.equal(post.authorName);
                });
        });
    });

});