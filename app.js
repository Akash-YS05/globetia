const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const Campground = require('./models/campgrounds')
const Joi = require('joi')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync')
mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(() => {
    console.log('DB Connection open!')
})
.catch(err => {
    console.log('oh no')
    console.log(err)
})

const app = express();

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.engine('ejs', ejsMate)
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))


app.get('/', (req, res) => {
    res.send('YelpCamp')
})

app.get('/campgrounds',  catchAsync (async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds', catchAsync (async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required(),
        }).required()
    })
    const {error} = campgroundSchema.validate(req.body)

    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    console.log(result)
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id', catchAsync (async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show',{campground})
}))

app.get('/campgrounds/:id/edit', catchAsync (async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
}))

app.put('/campgrounds/:id', catchAsync (async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync (async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) =>{
    const {statusCode = 500} = err
    if (!err.message) err.message = 'Oh no! An Error'
    res.status(statusCode).render('error', {err})
})

app.listen(3000, () => {
    console.log('Server Started!!')
})