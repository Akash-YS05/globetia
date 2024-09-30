const User = require("../models/user");

module.exports.renderRegister = (req, res)=>{
    res.render('auth/register')
}

module.exports.register = async (req, res, next) => {
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
}

module.exports.renderLogin = (req, res) => {
    res.render('auth/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'Logged In Succesfully!')
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Done! See you again!');
        res.redirect('/campgrounds');
    });
}