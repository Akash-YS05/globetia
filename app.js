const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');

const reviews = require('./routes/reviews')
const campgrounds = require('./routes/campgrounds');

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
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)
app.use(express.static(path.join(__dirname, 'public')))


app.get('/', (req, res) => {
    res.send('YelpCamp')
})



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