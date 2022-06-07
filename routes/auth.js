const express = require('express');
const passport = require('passport');
const { checkSchema, validationResult } = require('express-validator');
const { checkAuthenticated } = require('../middleware/auth');
var User = require('../models/user');


const router = express.Router();

// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/login', function (req, res) {
    // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage') });
});

// process the login form
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/dashboard', // redirect to the secure dashboard section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
router.get('/signup', function (req, res) {
    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message: req.flash('signupMessage') });
});

const PSWD_ERROR_MSG = "Password must contain at least 8 characters with at least: \n• 1 lowercase character \n• 1 uppercase character \n• 1 digit \n• 1 simbol";

// process the signup form
router.post('/signup',
    checkSchema({
        email: {
            in: ['body'],
            isEmail: true,
            errorMessage: 'Invalid email address!'
        },
        password: {
            in: ['body'],
            isStrongPassword: true,
            errorMessage: PSWD_ERROR_MSG
        }
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().map(e => e.msg).forEach(msg => req.flash('signupMessage', msg));
            return res.redirect("/signup");
        } else {
            next();
        }
    }, passport.authenticate('local-signup', {
        successRedirect: '/dashboard', // redirect to the secure dashboard section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

// =====================================
// LOGOUT ==============================
// =====================================
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// =====================================
// DELETE ==============================
// =====================================
router.post('/delete',
    checkAuthenticated,
    function (req, res) {
        User.findByIdAndRemove(req.user._id, function (err) {
            if (err) {
                res.status(404).send({'error': 'Unknown User ID'});
            } else {
                res.status(200).redirect('/');
            }
        });
    });

module.exports = router;