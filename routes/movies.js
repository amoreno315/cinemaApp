const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');
const User = require('../models/user');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const middlewares = require('../middlewares/middlewares')


/* GET movies page. */
router.get('/', middlewares.requireUser, (req, res, next) => {
  Movie.find()
    .then(movie => {
      res.render('movies', {movie});
    })
    .catch(error => {
      next(error);
    })
});

// create movie
router.get('/new', middlewares.requireUser, (req, res, next) => {
  res.render('movies/add')
})

router.post('/', middlewares.requireUser, (req, res, next) => {
  const movie = req.body
  Movie.create(movie)
  .then(() => {
    res.redirect('/movies');
  })
  .catch((error) => {
    next(error)
  })
})

router.get('/:id/edit', middlewares.requireUser, (req, res, next) => {
  const id = req.params.id;
  Movie.findById(id)
  .then(movie => {
    res.render('movies/edit', { movie: movie })
  })
  .catch(next);
})

router.post('/:id/favorites', middlewares.requireUser, (req, res, next) => {
  const movieId = req.params.id;
  const userId = req.session.currentUser._id;
  
  User.findById(userId)
  .then(user => {
    user.favorites.push(ObjectId(movieId));
    user.save()
    .then((success) => {
      req.flash('info', 'Añadido correctamente');
      res.redirect('/movies');
    })
    .catch(next);
  })
    .catch(next);
})

router.post('/:id', middlewares.requireUser, (req, res, next) => {
  const movie = req.body;
  const id = req.params.id;
  Movie.findByIdAndUpdate(id, movie)
  .then((result) => {
    res.redirect(`/movies/${id}`);
  })
  .catch(error => {
    console.log(error)
  })
})

router.post('/:id/delete', middlewares.requireUser, (req, res, next) => {
  const id = req.params.id;
  Movie.findByIdAndDelete(id)
  .then(result => {
    res.redirect('/movies');
  })
  .catch(error => {
    console.log(error)
  })
})

// Get movie detail
router.get('/:_id', middlewares.requireUser, (req, res, next) => {
  const id = req.params._id;
  Movie.findById(id)
    .then(movie => {
      res.render("displayMovie", {movie});
    })
    .catch(error => {
      console.log('Error finding movie ID', error);
    })
})






module.exports = router;
