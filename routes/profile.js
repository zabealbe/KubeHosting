const express = require('express');
const { checkAuthenticated } = require('../middleware/auth');


var router = express.Router();

// =====================================
// PROFILE SECTION =====================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (checkAuthenticated)
router.get('/profile',
    checkAuthenticated,
    function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

module.exports = router;