const express = require('express');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const middlewares = require('../middlewares/middlewares')

const saltRounds = 10;
const router = express.Router();

router.get('/signup', middlewares.requireAnon, (req, res, next) => {
  // que mal
  res.render('auth/signup', { error: 'No hay error' });
});

router.post('/signup', middlewares.requireAnon, (req, res, next) => {
  // const { username, password } = req.body;
  const username = req.body.username;
  const password = req.body.password;

  if ( !username || !password ) {
    // Don't do this render, bad practice
    // Returning so headers are not sent twice
    return res.render('auth/signup', { error: 'Username or password cannot be empty' });
  }
  
  User.findOne({ username })
    .then((user) => {
      if (user) {
        // returning so headers are not sent twice
        return res.render('auth/signup', { error: 'Username already taken' });
      }

      const salt  = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const newUser = new User({ username, password: hashedPassword });

      newUser.save()
        .then(() => {
          // guardamos el usuario en la session
          req.session.currentUser = newUser;
          // redirect siempre com barra
          res.redirect('/auth/profile');
        })
        .catch(next)
    })
    .catch(next)
});

router.get('/login', middlewares.requireAnon, (req, res, next) => {
  // Ui, esto entonces....
  res.render('auth/login');
});

router.post('/login', middlewares.requireAnon, (req, res, next) => {
  // Lo mismo que antes
  const { username, password } = req.body;

  if ( !username || !password ) {
    req.flash('error', 'Username or password are incorrect');
    return res.redirect('/auth/login');
  }

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        // No hacer esto... No hacer render in posts
        // returning
        req.flash('error', 'Username or password are incorrect');
        return res.redirect('/auth/login');
      }

      if (bcrypt.compareSync(password /* provided password */, user.password/* hashed password */)) {
        // Success
        // Adding user in session
        req.session.currentUser = user;
        res.redirect('/auth/profile');
      } else {
        // No, no, no, no, prohibido
        req.flash('error', 'Username or password are incorrect');
        res.redirect('/auth/login');
      }
    })
    .catch(next);
});

router.post('/logout', middlewares.requireUser, (req, res, next) => {
  req.session.destroy((err) => next(err));
  res.redirect('/');
});

router.get('/profile', middlewares.requireUser, (req, res, next) => {
  const id = req.session.currentUser._id;

  User.findById(id)
  .populate('favorites')
  .then((user) => {
    console.log('user', user);
    res.render('auth/profile', { user })
  })
  .catch(next);
});

module.exports = router;
