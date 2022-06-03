// set up ======================================================================
// get all the tools we need
var express  = require('express');
var path     = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var csrf         = require('csurf');

var configDB = require('./config/database.js');

// configuration ===============================================================
var app      = express();


mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({extended: false})); // get information from html forms
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'idkrandomseed' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
//app.use(csrf({ cookie: true }));
app.use(flash()); // use connect-flash for flash messages stored in session
//app.use(function(req, res, next) {
// res.locals.csrfToken = req.csrfToken();
// next();
//});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./routes/service.js')(app)
// launch ======================================================================
module.exports = app