const Post = require("../models/Post.model");

const isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/users/login');
    }
    next();
  };
  
  const isLoggedOut = (req, res, next) => {
    if (req.session.user) {
      return res.redirect('/');
    }
    next();
  };

  const isOwner = (req, res, next) => {
    console.log('params', req.params)
    Post.findById(req.params.postId)
    .populate("author")
    .then((foundPost) => {
      console.log('post', foundPost, req.session)
      if (foundPost.author._id.toString() !== req.session.user._id) {
        console.log(foundPost.author._id.toString() !== req.session.user._id)
        return res.redirect('/posts')
      }
      console.log(foundPost.author._id.toString() !== req.session.user._id)
      next();
    })
    .catch((err) => {
      console.log(err)
      next(err)
  })
  }
   
  module.exports = {
    isLoggedIn,
    isLoggedOut,
    isOwner
  };