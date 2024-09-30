const Campground = require("../models/campgrounds");

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  }

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
  }

module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id
    await campground.save();
    req.flash("success", "Campground added succesfully!");
    res.redirect(`/campgrounds/${campground._id}`);
  }

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      {
        path: 'reviews',
        populate: {
          path: 'author'
        }
      }).populate('author');       //populating the review and campground db both
    // console.log(campground)
    if (!campground) {
      req.flash("error", "Cannot find the campground.");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  }

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "Cannot find the campground.");
      return res.redirect("/campgrounds");
    }
  
    res.render("campgrounds/edit", { campground });
  }

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground,});
    req.flash("success", "Campground updated succesfully!");

    res.redirect(`/campgrounds/${campground._id}`);
  }

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground deleted succesfully!");

    res.redirect("/campgrounds");
  }