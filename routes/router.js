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
  var phone = req.body.phone;
  var designation = req.body.designation;
  var lat = req.body.lat2;
  var lang = req.body.lang2;

  var userData = {
    name: name,
    email:email,
    password: password,
    phone: phone,
    designation: designation,
    location: {
      lat: lat,
      lang: lang
    }
  }

  if(lat == ""){
   req.flash('info', 'Unable to fetch  location!');
   return res.redirect('/');
   // res.end();
   next();
 }

 /*User.find({
   email: email
 }, function (err, user){
   if(user){
     req.flash('info', 'User is already Registered');
     return res.redirect('/');
     // res.end();
     next();
   }

 });*/


  User.create(userData, function (error, user) {
    if (error) {
      return next(error);
    } else {
      req.flash('info', 'Registered Successfully!');
      return res.redirect('/');
      next();
    }
  });

});

router.post('/login', function(req, res, next){
  var email = req.body.email;
  var password = req.body.password;
  var lat = req.body.lat;
  var lang = req.body.lang;

  if(lat == ""){
   req.flash('info', 'Unable to fetch location!');
   return res.redirect('/');
   next();
 }

  var locationData = {
    location: {
      lat: lat,
      lang: lang
    }
  }

  User.authenticate(email, password, function (error, user) {
      if (error || !user) {
        req.flash('info', 'User not found!');
        return res.redirect('/');
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
      User.find({
        designation: 'teacher'
      }).then((user) =>{
        res.render('dashboard', {
        users: user,
        });
      }, (err) => {
      res.status(400).send(err);
    });

  } else if(designation === 'Teacher'){
      User.find({
        designation: 'student'
      }).then((user) =>{
        console.log(user);
        res.render('dashboard', {
        users: user,
        });
      }, (err) => {
      res.status(400).send(err);
    });
  }

});

// router.post('/postLocation', (req, res) => {
//   var lat = req.body.lat;
//   var lang = req.body.lang;
//
//   var locationData = {
//     location: {
//       lat: lat,
//       lang: lang
//     }
//   }
//
//   User.findOneAndUpdate(
//       {_id :ObjectID(req.session.userId)},
//         {$set: locationData},
//         function (err, result) {
//           if(err){
//             console.log(err);
//           }
//   });
//
// });

module.exports = router;
