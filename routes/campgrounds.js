const express = require("express");
const router = express.Router();
const passport = require('passport')
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campgrounds");
const campgrounds = require('../controllers/campgrounds')
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')

router.route('/')
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn, validateCampground,catchAsync(campgrounds.createCampground)); 


router.route('/new')
  .get(isLoggedIn, campgrounds.renderNewForm);


router.route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));



module.exports = router;
