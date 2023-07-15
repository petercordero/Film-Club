const router = require("express").Router();

const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Comment = require('../models/Comment.model')

// ****************************************************************************************
// GET route to display the form to create a new post
// ****************************************************************************************

// localhost:3000/post-create
router.get("/post-create", (req, res) => {
  User.find()
    .then((dbUsers) => {
      res.render("posts/create", { dbUsers });
    })
    .catch((err) => console.log(`Err while displaying post input page: ${err}`));
});

// routes/post.routes.js
// all imports stay untouched

// ****************************************************************************************
// POST route to submit the form to create a post
// ****************************************************************************************

// <form action="/post-create" method="POST">
router.post('/post-create', (req, res, next) => {
  const { title, content, author } = req.body;
  // 'author' represents the ID of the user document

  Post.create({ title, content, author })
    .then(dbPost => {
      // when the new post is created, the user needs to be found and its posts updated with the
      // ID of newly created post
      return User.findByIdAndUpdate(author, { $push: { posts: dbPost._id } });
    })
    .then(() => res.redirect('/posts')) // if everything is fine, redirect to list of posts
    .catch(err => {
      console.log(`Err while creating the post in the DB: ${err}`);
      next(err);
    });
});

router.get('/', (req, res, next) => {
  Post.find()
    .populate('author') // --> we are saying: give me whole user object with this ID (author represents an ID in our case)
    .then(dbPosts => {
      // console.log("Posts from the DB: ", dbPosts);
      res.render('posts/list.hbs', { posts: dbPosts });
    })
    .catch(err => {
      console.log(`Err while getting the posts from the DB: ${err}`);
      next(err);
    });
});

router.get('/details/:postId', (req, res, next) => {
  const { postId } = req.params;
 
  Post.findById(postId)
    .populate('author')
    .populate({
      // we are populating author in the previously populated comments
      path: 'comments',
      populate: {
        path: 'author',
        model: 'User'
      }
    })
    .then(foundPost => res.render('posts/details', foundPost))
    .catch(err => {
      console.log(`Err while getting a single post from the  DB: ${err}`);
      next(err);
    });
});

router.post('/comment/:postId', (req, res, next) => {
  const { postId } = req.params;
  const { author, content } = req.body;
 
  let user;
 
  User.findOne({ username: author })
    .then(userDocFromDB => {
      user = userDocFromDB;
 
      // 1. if commenter is not user yet, let's register him/her as a user
      if (!userDocFromDB) {
        return User.create({ username: author });
      }
    })
    .then(newUser => {
      // prettier-ignore
      Post.findById(postId)
      .then(dbPost => {
        let newComment;
 
        // 2. the conditional is result of having the possibility that we have already existing or new users
        if (newUser) {
          newComment = new Comment({ author: newUser._id, content });
        } else {
          newComment = new Comment({ author: user._id, content });
        }
 
        // 3. when new comment is created, we save it ...
        newComment
        .save()
        .then(dbComment => {
 
          // ... and push its ID in the array of comments that belong to this specific post
          dbPost.comments.push(dbComment._id);
 
          // 4. after adding the ID in the array of comments, we have to save changes in the post
          dbPost
            .save()       // 5. if everything is ok, we redirect to the same page to see the comment
            .then(updatedPost => res.redirect(`/posts/details/${updatedPost._id}`))
        });
      });
    })
    .catch(err => {
      console.log(`Error while creating the comment: ${err}`);
      next(err);
    });
});
module.exports = router;
