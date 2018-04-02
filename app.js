var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash  = require('connect-flash');
var cookieParser = require('cookie-parser');

const port = process.env.PORT || 3000;

mongoose.connect('mongodb://neo:neo123@ds113648.mlab.com:13648/neo',(err, db) => {
  if(err){
    return console.log(err);
  }
})
var db = mongoose.connection;


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {

});


app.use(session({
  secret: 'tunuk tunuk',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(flash());


app.use(express.static(__dirname + '/views'));


var routes = require('./routes/router');
app.use('/', routes);


app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});


app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});


app.listen(port, function () {
  console.log(`Express app listening on port ${port}`);
});
