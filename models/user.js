const mongoose = require("mongoose");
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

userSchema.plugin(passportLocalMongoose)    //adds a username password parameter
module.exports = mongoose.model('User', userSchema)