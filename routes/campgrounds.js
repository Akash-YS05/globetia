const express = require("express");
const router = express.Router();
const passport = require('passport')
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campgrounds");
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')


router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id
    await campground.save();
    req.flash("success", "Campground added succesfully!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      {
        path: 'reviews',
        populate: {
          path: 'author'
        }
      }).populate('author');       //populating the review and campground db both
    console.log(campground)
    if (!campground) {
      req.flash("error", "Cannot find the campground.");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  })
);

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "Cannot find the campground.");
      return res.redirect("/campgrounds");
    }
  
    res.render("campgrounds/edit", { campground });
  })
);

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground,});
    req.flash("success", "Campground updated succesfully!");

    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground deleted succesfully!");

    res.redirect("/campgrounds");
  })
);

module.exports = router;
