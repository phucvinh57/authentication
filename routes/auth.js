var express = require('express');
var bcrypt = require('bcrypt');
const saltRounds = 10;
var router = express.Router();
var connection  = require('../lib/db');

router.get('/', function(req, res, next) {
    res.render('auth/home', {
        title: 'Home'   
    });
});
router.get('/home', function(req, res, next) {
    res.render('auth/home', {
        title: 'Home'   
    });
});
router.get('/login', function(req, res, next) {
    if(req.session.loggedIn === true) {
        console.log('Already logged in !!!');
        res.render('auth/home', {
            title: 'Home'
        });
    }
    else res.render('auth/login', {
        title: 'Login',
        email: '',
        password: ''     
    });
});
router.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});
router.get('/signup', function(req, res, next){
    if(req.session.loggedIn === true) {
        console.log('Already logged in !!!');
        res.render('auth/home', {
            title: 'Home'
        });
    }
    else res.render('auth/signup', {
        title: 'Sign Up',
        email: '',
        password: ''
    });
});

router.post('/authentication', function(req, res, next){
    var email = req.body.email;
    var password = req.body.password;
    let hash = 'aaaa';
    connection.query('SELECT password FROM users WHERE email = ?', [email], function(error, results, fields) {
        if(error) console.log(error);
        hash = results[0].password;
        bcrypt.compare(password, hash, function(err, result) {
            if(result === true) {
                // if result == true, password matched
                req.session.loggedIn = true;
                res.redirect('/auth/home');
            }
            else {
                // else wrong password
                console.log('Uncorrect account. Please login again !!!');
                res.redirect('/auth/login');
            }
        });
    });
});
router.post('/newaccount', function(req, res, next){
    var email = req.body.new_email;
    var name = req.body.name;
    var studentID = req.body.id;
    var password = req.body.new_password;
    var retypePassword = req.body.retype_password;

    if(password === retypePassword) {
        bcrypt.hash(password, saltRounds, function(error, hash) {
            // Store hash in your password DB.
            if(error) {
                console.log(error);
                res.redirect('/auth/signup');
            }
            connection.query(`INSERT INTO users VALUES (?,?,?,?)`, [studentID, name, hash, email], function(err,results){
                if(err) console.log(err);
                console.log('Create new account successfully !!!');
                req.session.loggedIn = true;
                res.redirect('/auth/home');
            });
        });
    }
    else {
        console.log('Uncorrect retyped password !!!');
        res.redirect('/auth/signup');
    }
});
module.exports = router;