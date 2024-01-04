const mongoose = require('mongoose');
const validator = require('validator');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minLength: 8,
    select: false,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (x) {
        return x === this.password;
      },
      message: 'Password must be same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active : {
    type:Boolean,
    default: true,
    select : false
  }
});

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();

//   this.password = await bcrypt.hash(this.password, 12);
//   this.passwordConfirm = undefined;
//   next();
// });

// userSchema.pre('save', function(next){
//   if(!this.isModified('password') || this.isNew) return next()


//   this.passwordChangedAt = Date.now()-1000;
//   next()
// })

// userSchema.pre(/^find/,function(next){
//   this.find({active : {$ne : false}})
//   next()
// })


userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    console.log(changedStamp, JWTTimeStamp);
    return JWTTimeStamp < changedStamp; // 100 < 200
  }

  return false; //User never change his password
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

console.log({resetToken},this.passwordResetToken)

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
