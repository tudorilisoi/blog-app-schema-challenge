'use strict'

//declare global STATE object
const STATE = {                              
    blogPosts: null,
}

//API call to retreive blog posts
//add data to STATE
//call display function
//log current state to console
function getBlogPosts() {                   
    const settings = {
        url: '/posts',
        dataType: 'json',
        type: 'GET'
    }

    $.ajax(settings).then((results) => {
        STATE.blogPosts = results;          
        displayBlogPosts();                 
    }).catch(showError);
    
    console.log(STATE);
}

//API call to delete blog posts
//Retreive & display updated STATE
function deleteBlogPost(id) {                
    const settings = {
        url: `/posts/${id}`,
        dataType: 'json',
        type: 'DELETE'
    }

    $.ajax(settings).catch(showError);
    getBlogPosts();                         
}

//API call to create blog posts
//retreive & display updated STATE
function createBlogPost(title, content, firstName, lastName) {
    const settings = {
        url: `/posts`,
        data: JSON.stringify({
            title: title,
            content: content,
            author: {
                firstName: firstName,
                lastName: lastName
            }
        }),
        contentType: 'application/json',
        dataType: 'json',
        type: 'POST'
    }

    $.ajax(settings).catch(showError);
    getBlogPosts();
}

//Pass individual blog posts through render function & update DOM
function displayBlogPosts() {               
    const blogPosts = STATE.blogPosts.posts.map((post, index) => renderBlogPost(post, index));
    $('.js-blog-posts').prop('hidden', false);
    $('.js-blog-posts').html(blogPosts);
}

//HTML template for each individual blog post
function renderBlogPost(post, index) {
    const title = post.title;
    const content = post.content;
    const author = post.author;
    const date = post.created;
    const comments = post.comments.map((comment, index) => {
        const content = comment.content;
        return `<p data-index="${index}"><small>${content}</small></p>`
    }).join('');

    return `
        <div class="blog-post">
            <h2>${title}</h2>
            <p>${content}</p>
            <p>Published by ${author} on ${date}</p>
            <h3>Comments</h3>
            <p>${comments}</p>
            <button class="js-delete" data-index="${index}">Delete Post</button>
        </div>
    `
}

//Handle blog post deletion by retreiving value of "id" property
function clickDeletePost() {
    $('body').on('click', '.js-delete', function(event) {
        event.preventDefault();
        const index = $(event.target).attr('data-index');
        const id = STATE.blogPosts.posts[index].id;
        deleteBlogPost(id);
    });
}

//Handle blog post creation by retreiving user inputs
//reset value of each input text box after API call
function clickCreatePost() {
    $('.js-create-btn').on('click', function(event) {
        event.preventDefault();
        const title = $('#title').val();
        const content = $('#content').val();
        const firstName = $('#first-name').val();
        const lastName = $('#last-name').val();

        createBlogPost(title, content, firstName, lastName);

        $('#title').val('');
        $('#content').val('');
        $('#first-name').val('');
        $('#last-name').val('');
    });
}

//Display error if API calls fail
function showError() {                      
    $('.js-message').prop('hidden', false);
    $('.js-message').text('There was an error loading the requested data');
}

//Document ready function declaration & call
function handleBlog() {                    
    getBlogPosts();
    clickDeletePost();
    clickCreatePost();
}

$(handleBlog);                             