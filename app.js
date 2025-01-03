if (process.env.NODE_ENV !== "production") {
  require('dotenv').config()
}

const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require('passport')
const localStrategy = require('passport-local')    //these combined provide the tools that we would have to write otherwise to set up authentication
const expressSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo')(session)

const reviewRoutes = require("./routes/reviews");
const campgroundRoutes = require("./routes/campgrounds");
const userRoutes = require('./routes/users')
const User = require('./models/user');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("DB Connection open!");
  })
  .catch((err) => {
    console.log("oh no");
    console.log(err);
  });

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(expressSanitize({
  replaceWith: '_'
}));
app.use(helmet())
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
  "https://api.maptiler.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/ddkt00y0i/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
              "https://images.unsplash.com/",
              "https://api.maptiler.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

const secret = process.env.SECRET || 'temporarysecret'

const store = new MongoStore({
  url: dbUrl,
  secret: secret,
  touchAfter: 24*60*60
})

store.on("error", function(err) {
  console.log("Session store error");
  
})

const sessionConfig = {
    store, 
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  };


app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // console.log(req.query)
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use('/', userRoutes)


app.get('/fakeuser', async (req, res) =>{
  const user = new User({name: 'akash', email: 'akash00@gmail.com', username: 'akashys'})
  const newUser = await User.register(user, 'noodles')    //uses "pbkdf2" library insted of bcrypt 
  res.send(newUser)
})


app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no! An Error";
  res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log("Server Started!!");
});
