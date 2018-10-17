const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');
const User = require('../models/user');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;



/* GET movies page. */
router.get('/', (req, res, next) => {
  Movie.find()
    .then(movie => {
      res.render('movies', {movie});
    })
    .catch(error => {
      next(error);
    })
});

// create movie
router.get('/new', (req, res, next) => {
  res.render('movies/add')
})

router.post('/', (req, res, next) => {
  const movie = req.body
  Movie.create(movie)
  .then(() => {
    res.redirect('/movies');
  })
  .catch((error) => {
    next(error)
  })
})

router.get('/:id/edit', (req, res, next) => {
  const id = req.params.id;
  Movie.findById(id)
  .then(movie => {
    res.render('movies/edit', { movie: movie })
  })
  .catch(next);
})

router.post('/:id/favorites', (req, res, next) => {
  const id = req.params.id;
  
  User.findOne({userName: 'Paco'})
  .then(user => {
    console.log(user)
    user.favorites.push(ObjectId(id));
    user.save()
    .then((success) => {
      console.log('success', success);
      res.redirect('/movies');
    })
    .catch(next);
  })
    .catch(next);
})

router.post('/:id', (req, res, next) => {
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

router.post('/:id/delete', (req, res, next) => {
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
router.get('/:_id', (req, res, next) => {
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
