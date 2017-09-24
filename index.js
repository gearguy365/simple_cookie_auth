var express = require('express');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var request = require('request');
var mongoose = require('mongoose');
require('./config/passport')(passport);
var app = express();
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.use(session({ 
    secret: 'ilovescotchscotchyscotchscotch',
    saveUninitialized: true,
    cookie: { 
        path: '/', 
        httpOnly: true, 
        secure: false, 
        maxAge: null,
        domain: '.' 
    }
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, credentials");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

var options = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
};
//mongoose.connect('mongodb://admin:admin@ds143539.mlab.com:43539/news', options);
mongoose.connect('mongodb://localhost:27017/loginapp', options);
var connection = mongoose.connection;
connection.once('open', function () {
    console.log('mongodb connection successful!');
});
connection.on('error', function (error) {
    console.log('an error occured while trying to connect to mongoDB');
    console.log(error);
});

var port = process.env.PORT || 3000;

app.post('/signup', function (req, res) {
    console.log('sign up hit');
    passport.authenticate('local-signup', function (err, user, info) {
        if (err) {
            res.send({
                status: 1,
                message: err
            });
        } else if (info) {
            res.send({
                status: 1,
                message: info
            });
        } else {
            res.send({
                status: 0,
                message: 'registration successful'
            })
        }
    })(req, res);
});

app.post('/login', function (req, res, next) {
    passport.authenticate('local-login', function (err, user, info) {
        if (err) {
            res.send({
                status: 1,
                message: err
            });
        }
        else if (info) {
            res.send({
                status: 1,
                message: info
            });
        } else {
            req.logIn(user, function (err) {
                if (err) {
                    res.send({
                        status: 1,
                        message: err
                    });
                }
                //res.cookie('name', 'tobi', { domain: 'jamahook.fakedomain.com', path: '/', secure: true });
                res.send({
                    status: 0,
                    message: 'login successful'
                });
            });

        }
    })(req, res, next);
});

app.get('/logout', function (req, res) {
    req.logout();
    res.status(200).send('success');
});

app.get('/products', function (req, res, next) {

    if (req.isAuthenticated()) {
        console.log('authorized');
        res.send('products');
    } else {
        console.log('unauthorized');
        res.send('unauth');
    }
});

app.listen(port, function () {
    console.log('server is listening on port ' + port);
});