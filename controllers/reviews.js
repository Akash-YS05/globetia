const Review = require("../models/review");
const Campground = require("../models/campgrounds");

module.exports.submitReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Review published!");

    res.redirect(`/campgrounds/${campground._id}`);
  }

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //mongoose operator which removes all instances of the value given from the array
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted succesfully!");

    res.redirect(`/campgrounds/${id}`);
  }