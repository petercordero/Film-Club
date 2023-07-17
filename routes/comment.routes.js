const router = require("express").Router();

const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");

router.post('/posts/comment/:postId', (req, res, next) => {
  const { postId } = req.params;
  const { content } = req.body;
  const  author  = req.session.user._id;

  Comment.create({
    author: author, content
  })
    .then(newComment => {

      return Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } }, { new: true })
    })
    .then((updatedPost) => {

      res.redirect(`/posts/details/${postId}`)
    })
    .catch(err => {
      console.log(`Error while creating the comment: ${err}`);
      next(err);
    });
});


module.exports = router;
