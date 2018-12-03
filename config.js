'use strict'

//configure values for mongoDB URL & port the app will run on
exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/blogPosts";
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "mongodb://localhost/test-blogPosts";
exports.PORT = process.env.PORT || 8080;
