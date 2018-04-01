const express = require('express');
var router = express();
const ejs = require('ejs');
const {ObjectID} = require('mongodb');

var User = require('../models/user');

router.set('view engine', 'ejs');

router.get('/', (req, res) => {
  res.render('index',  { msgs: req.flash('info') });
});

router.post('/register', function(req, res, next){

  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var designation = req.body.designation;

  var userData = {
    name: name,
    email:email,
    password: password,
    designation: designation,
  }
  console.log(userData);
  User.create(userData, function (error, user) {
    if (error) {
      return next(error);
    } else {
      req.flash('info', 'Registered!');
      res.redirect('/');
    }
  });

});

router.post('/login', function(req, res, next){
  var email = req.body.email;
  var password = req.body.password;
  var lat = req.body.lat;
  var lang = req.body.lang;

  var locationData = {
    location: {
      lat: lat,
      lang: lang
    }
  }

  User.authenticate(email, password, function (error, user) {
      if (error || !user) {
        var err = new Error(error);
          err.status = 401;
          return next(err);
      } else {


       console.log(locationData);
       User.findOneAndUpdate(
           {email : email},
             {$set: locationData},
             function (err, user) {
               if(err){
                 console.log(err);
               }
               console.log(user);
               req.session.userId = user._id;
               if(user.designation == 'student'){
                 return res.redirect('/dashboard/Student');
               } else if (user.designation == 'teacher'){
                  return res.redirect('/dashboard/Teacher');
               }
       });
        // try {
        //   User.findOneAndUpdate(
        //       {_id : ObjectID(user._id)},
        //         {$set: locationData},
        //         function (err, result) {
        //           if(err){
        //             console.log(err);
        //           }
        //   });
        // } catch (err) {
        //   console.log(err);
        // } finally {
        //   User.findOneAndUpdate(
        //       {email : email},
        //         {$set: locationData},
        //         function (err, result) {
        //           if(err){
        //             console.log(err);
        //           }
        //   });
        // }



      }
    });

});

function loggedIn(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/');
    }
}

router.get('/logout', function (req, res, next) {
  if (req.session) {
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

router.get('/dashboard/:designation', loggedIn, function(req, res, next) {
  var designation = req.params.designation;

  if(designation === 'Student'){
    res.render('dashboard');
  } else if(designation === 'Teacher'){
    res.render('dashboard');
  }

});

router.post('/postLocation', (req, res) => {
  var lat = req.body.lat;
  var lang = req.body.lang;

  var locationData = {
    location: {
      lat: lat,
      lang: lang
    }
  }

  User.findOneAndUpdate(
      {_id :ObjectID(req.session.userId)},
        {$set: locationData},
        function (err, result) {
          if(err){
            console.log(err);
          }
  });

});

module.exports = router;
