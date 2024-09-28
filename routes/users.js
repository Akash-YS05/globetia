const express = require("express");
const router = express.Router();
const passport = require('passport')
const catchAsync = require('../utils/catchAsync')
const User = require("../models/user");
const {storeReturnTo} = require('../middleware')

router.get('/register', (req, res)=>{
    res.render('auth/register')
})

router.post('/register', catchAsync( async (req, res, next) => {
    try {
        const {username, email, password} = req.body
        const user = new User({username, email})
        const newUser = await User.register(user, password)
        req.login(newUser, err => {
            if (err) return next(err);
            req.flash('success', 'Registered Succesfully!')
            res.redirect('/campgrounds')
        })
        
    } catch(e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}))

router.get('/login', (req, res) => {
    res.render('auth/login')
})

router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'Logged In Succesfully!')
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl)

})

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Done! See you again!');
        res.redirect('/campgrounds');
    });
}); 

module.exports = router;
