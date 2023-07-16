const router = require("express").Router();
const User = require("../models/User.model");
const Post = require('../models/Post.model');
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');
const bcrypt = require('bcryptjs')
const salt = 10;


router.get("/sign-up", (req, res) => res.render("users/sign-up"));

router.post("/sign-up", (req, res, next) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    res.render("users/sign-up", {message: "All fields are mandatory. Please provide your username and password."});
    return;
  };  

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res
      .status(500)
      .render("users/sign-up", {
        message:
          "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
      });
    return;
  };

  bcrypt
  .genSalt(salt)
  .then((salts) => {
    return bcrypt.hash(password, salts);
  })
  .then((hashedPass) =>{
    return User.create({ username, password: hashedPass })
})
  .then((createdUser) => {
    console.log("Created user:", createdUser)
    res.redirect("/")
})
  .catch((error) => {
    console.log("error line 35:", error)
    if (error.code === 11000) {
      console.log("Username must be unique. Username is already used."); 
      res.status(500).render("users/sign-up.hbs", {message: "User already exists."});
    } else {
      next(error);
    }
  });

  User.findOne({ username })
    .then((userDocFromDB) => {
      if (!userDocFromDB) {
        User.create({ username })
        .then(() => res.redirect('/posts/post-create'));
      } else {
        res.render("users/sign-up", { message: "It seems you are already registered. 📽️" });
        return;
      }
    })
    .catch((err) => console.log(`Error while creating a new user: ${err}`));
});


router.get("/login", isLoggedIn, (req, res) => res.render("users/login"));

router.post('/login', (req, res) => {
  console.log('SESSION =====> ', req.session);
  const { username, password } = req.body;
 
  if (!username || !password) {
    res.render('users/login', {
      message: "Please enter both username and password to login."
    });
    return;
  };
 
//   User.findOne({ username })
//     .then(user => {
//       if (!user) {
//         console.log("Username not registered.");
//         res.render('users/login.hbs', { message: 'User not found and/or incorrect password.' });
//         return;
//       } else if (
//         bcrypt.compareSync(password, user.password)) {
        
//         req.session.user = user  

//         console.log("Sessions after login:", req.session)

//         res.redirect('/')
//       } else {
//         console.log("Incorrect password.");
//         res.render('users/login.hbs', { message: 'User not found and/or incorrect password.' });
//       }
//     })
//     .catch(error => next(error));
});

router.get('/user-profile', isLoggedOut, (req, res) => {
  res.render('users/user-profile', { userInSession: req.session.user });
});

router.get("/", (req, res) => {
  User.find()
    .then((usersFromDB) => res.render("users/list", { users: usersFromDB }))
    .catch((err) => console.log(`Error while getting users from the DB: ${err}`));
});

router.get("/posts/:userId", (req, res, next) => {
  Post.find({
    author: req.params.userId
  })
  .populate('author')
  .then((foundPosts) => {
    res.render('users/details.hbs', {posts: foundPosts})
  })
  .catch((err) => {
    next(err)
  })
});

module.exports = router;
