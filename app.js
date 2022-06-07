// set up ======================================================================
var express      = require('express');
var path         = require('path');
var mongoose     = require('mongoose');
var passport     = require('passport');
var flash        = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var csrf         = require('csurf');

var configDB     = require('./config/database.js');

// configuration ===============================================================
var app          = express();


mongoose.connect(configDB.url);                // connect to our database

require('./config/passport')(passport);        // pass passport for configuration
require('./config/plans')(mongoose);           // populate database with plans

// set up our express application
app.use(morgan('dev'));                        // log every request to the console
app.use(cookieParser());                       // read cookies (needed for auth)
app.use(bodyParser());                         // get information from html forms
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');                 // set up ejs for templating

// required for passport
app.use(session({
  secret: process.env.SESSION_SECRET,  // session secret
  cookie: {
    sameSite: true,
  }
}));
app.use(passport.initialize());
app.use(passport.session());                   // persistent login sessions
app.use(csrf({ cookie: true }));
app.use(flash());                              // use connect-flash for flash messages stored in session
app.use(function(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// routes ======================================================================
app.use('/', require('./routes/index'));
app.use('/', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/profile', require('./routes/profile'));
app.use('/', require('./routes/subscription'));

// require to be authenticated for /api routes
const { checkAuthenticated } = require('./middleware/auth');
app.use('/api', checkAuthenticated);

app.use('/api/v1', require('./routes/services'));
app.use('/api/v1', require('./routes/images'));

// launch ======================================================================
if (process.env.NODE_ENV === 'test') {
  console.log('Running in test mode, some functions will be disabled');
} else {
  console.log('Running in production mode');
}

module.exports = app