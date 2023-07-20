const router = require("express").Router();

const User = require("../models/User.model");
const Post = require("../models/Post.model");

const { isLoggedIn, isLoggedOut, isOwner } = require('../middleware/route-guard.js');

router.get("/new-review", isLoggedIn, (req, res) => {
      res.render("posts/create")
    });

    router.post('/new-review', isLoggedIn, (req, res, next) => {
      const { title, content, imageUrl, rating } = req.body;
    
      const author  = req.session.user._id
    
      if (!imageUrl) {
        Post.create({ title, content, rating, author })
        .then(dbPost => {
    
          console.log("DBPOST", dbPost, author )
        
          return User.findByIdAndUpdate(author, { $push: { posts: dbPost._id } }, {new: true});
        })
        .then((updatedUser) => {
          console.log("updated user", updatedUser)
          res.redirect('/posts')})
        .catch(err => {
          console.log(`Err while creating the post in the DB: ${err}`);
          next(err);
        });
      } else {
    
        Post.create({ title, content, rating, imageUrl, author })
          .then(dbPost => {
      
            console.log("DBPOST", dbPost, author )
          
            return User.findByIdAndUpdate(author, { $push: { posts: dbPost._id } }, {new: true});
          })
          .then((updatedUser) => {
            console.log("updated user", updatedUser)
            res.redirect('/posts')})
          .catch(err => {
            console.log(`Err while creating the post in the DB: ${err}`);
            next(err);
          });
      };
    });

router.get('/', (req, res, next) => {
  Post.find()
    .populate('author')
    .then((foundPosts) => {
      let posts = foundPosts.map((post) => {
        return {...post._doc, now: post.createdAt.toLocaleDateString()}
      })
      res.render('posts/list.hbs', { posts })
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
      path: 'comments',
      populate: {
        path: 'author',
        model: 'User'
      }
    })
    .then(foundPost => res.render('posts/details', {post: foundPost, now: foundPost.createdAt.toLocaleDateString()}))
    .catch(err => {
      console.log(`Err while getting a single post from the  DB: ${err}`);
      next(err);
    });
});

router.get('/edit/:postId', isLoggedIn, isOwner, (req, res, next) => {

  Post.findById(req.params.postId)
  .populate('author')
  .then((foundPost) => {
      console.log("Found Post", foundPost)
      res.render('posts/edit.hbs', foundPost)
  })
  .catch((err) => {
      console.log(err)
      next(err)
  })

});

router.post('/edit/:postId', isLoggedIn, isOwner, (req, res, next) => {

  const { title, content, rating, imageUrl } = req.body

  Post.findByIdAndUpdate(
      req.params.postId,
      {
          title,
          content,
          imageUrl,
          rating
      },
      {new: true}
  )
  .then((updatedPost) => {
      res.redirect(`/posts/details/${updatedPost._id}`)
  })
  .catch((err) => {
      console.log(err)
      next(err)
  })

});

router.get('/delete/:postId', isLoggedIn, isOwner, (req, res, next) => {
  
  Post.findByIdAndDelete(req.params.postId)
  .then((deletedPost) => {
      // console.log("Deleted post:", deletedPost)
      res.redirect('/posts')
  })
  .catch((err) => {
      console.log(err)
      next(err)
  })

});

module.exports = router;
