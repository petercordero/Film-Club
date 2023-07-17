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
    res.render("users/sign-up", { message: "All fields are mandatory. Please provide your username and password." });
    return;
  };

  // const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  // if (!regex.test(password)) {
  //   res
  //     .status(500)
  //     .render("users/sign-up", {
  //       message:
  //         "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
  //     });
  //   return;
  // };

  User.findOne({ username })
    .then((userDocFromDB) => {
      if (!userDocFromDB) {
        bcrypt
          .genSalt(salt)
          .then((salts) => {
            return bcrypt.hash(password, salts);
          })
          .then((hashedPass) => {
            console.log("hashed pass", hashedPass)
            return User.create({ username, password: hashedPass })
          })
          .then((createdUser) => {
            console.log("Created user:", createdUser)
            res.redirect("/users/login")
          })
          .catch((error) => {
            console.log("error line 35:", error)
            next(error);
          });
      } else {
        res.render("users/sign-up.hbs", { message: "It seems you are already registered." });
        return;
      }
    })
    .catch((err) => {
      console.log(err)
      next(err)
    })




});


router.get('/login', (req, res, next) => {
  res.render('users/login.hbs')
})

router.post('/login', isLoggedOut, (req, res, next) => {

  const { username, password } = req.body;

  if (!username || !password) {
    res.render('users/login.hbs', {
      message: "Please enter both username and password to login."
    });
    return;
  }

  User.findOne({ username })
    .then(user => {
      if (!user) {
        console.log("Username not registered.");
        res.render('users/login.hbs', { message: 'User not found and/or password is incorrect.' });
        return;
      }
      console.log(req.session)
      if (bcrypt.compareSync(password, user.password)) {

        req.session.user = user

        console.log("Session:", req.session)
        console.log("This is a session", req.session)

        res.redirect('/')
      } else {

        console.log("Incorrect password.");
        res.render('users/login.hbs', { message: 'User not found and/or password is incorrect.' });
      }



    })
    .catch(error => {
      console.log("Error:", error)
      next(error)
    });
});

router.get('/user-profile', isLoggedIn, (req, res) => {
  const userId = req.session.user._id;
  User.findById(userId)
    .populate({
      path: 'posts',
      populate: {
        path: 'author',
        model: 'User'
      }
    })
    .then((foundUserInfo) => {
      console.log("Found user:", foundUserInfo)
      res.render('users/user-profile.hbs', { userInSession: req.session.user, userInfo: foundUserInfo });
    })
    .catch(error => {
      console.log("Error:", error)
      next(error)
    });
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
      res.render('users/user-profile.hbs', { posts: foundPosts })
    })
    .catch((err) => {
      next(err)
    })
});

router.get('/logout', isLoggedIn, (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/")
    console.log("Session", req.session)
  })
})

module.exports = router;
