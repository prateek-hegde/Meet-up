var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  location: {
    lat:{
      type: String,
      required: true,
      default: " "
    },
    lang:{
      type: String,
      required: true,
      default: " "
    }
  }
});

UserSchema.statics.authenticate = function (email, password, callback) {
  User.findOne({ email: email})
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (user) {
        bcrypt.compare(password, user.password, function (err, result) {
          if (result === true) {
            return callback(null, User);
          } else {
            return callback();
          }
        })
      } else {
        var err = new Error('User not found');
        err.status = 401;
        return callback(err);
      }

    });
}

UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
