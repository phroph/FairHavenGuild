var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var passport = require('passport');
var mongoose = require('mongoose');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var BnetStrategy = require('passport-bnet').Strategy;
var BNET_KEY = process.env.BNET_KEY;
var BNET_SECRET = process.env.BNET_SECRET;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var apis = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(function(user, done) {
  if(user.id.substring(0,5) == "bnet-") {
    user.id = user.id.substring(5);
    Account.findOne({ 'bnetId' : user.id}, function(err, bnetUser) {
      if(err) {
        console.log("Could not find account associated with id: " + user.id);
        done(err);
      } else if(bnetUser == null) {
        console.log("Could not find account associated with id: " + user.id);
        done(null, null);
      } else {
        console.log("Found user for Battle.net id: " + user.id);
        console.log("Serializing: " + bnetUser.id);
        done(null, bnetUser.id);
      }
    })
  } else {
    console.log("Serializing: " + user.id);
    done(null, user.id);
  }
});
passport.deserializeUser(function(id, done) {
  console.log("Deserializing: " + id);
  Account.findOne({ '_id' : id}, function(err, user) {
    if (err) {
      done(err);
    } else {
      console.log("Found user: " + user);
      done(null, user);
    }
  });
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'somestupidsecret' }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', users);
app.use('/api', apis);



// Use the BnetStrategy within Passport.
passport.use(new BnetStrategy({
  clientID: BNET_KEY,
  clientSecret: BNET_SECRET,
  callbackURL: "https://fairhavenguild.com/auth/bnet/callback",
  passReqToCallback : true
}, function(req, accessToken, refreshToken, profile, done) {
  var user = req.user;
  console.log("BNet Auth Successful");
  console.log("Access Token: " + accessToken);
  console.log("Refresh Token: " + refreshToken);
  console.log("Profile: " + profile);
  user.bnet.id = profile.id;
  user.bnet.token = accessToken;
  user.save(function(err) {
    if (err)
    {
      console.log("Failed to connect BNet Account: " + err);
      throw err;
    } else {
      console.log("Successfully connected BNet Account");
      done(null, user);
    }
  });
}));

// mongoose
mongoose.connect('mongodb://localhost/passport_local_mongoose');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("Connected to MongoDB");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
