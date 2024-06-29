const Campground = require('../models/campgrounds')
const {places, descriptors} = require('./seedHelpers')
const cities = require('./cities')
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(() => {
    console.log('DB Connection open!')
})
.catch(err => {
    console.log('oh no')
    console.log(err)
})

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDb = async () => {
    await Campground.deleteMany({})
    for (let i=0;i<50;i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 1000)
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://unsplash.com/collections/SAoQrQh_hg8/landscape-wallpaper',
            description: '  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nisi libero temporibus nam aspernatur ea! Doloribus, labore placeat excepturi, sit aliquam libero esse quisquam minus tenetur consequatur eius deleniti, sed perspiciatis.',
            price
        })
        await camp.save()
    }
}

seedDb().then(() => {
    mongoose.connection.close()
})

