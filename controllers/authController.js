const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const sendEmail = require(`../utils/email`);
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

const createSendToken = (user, statusCode, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  const token = signToken(user._id);
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);


  //Remove the password from the body
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};



exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //Check password and email exist
  if (!email || !password) {
    return next(new AppError('Please provide a password and email', 400));
  }

  //Check email and password correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect password or email', 401));
  }
  // console.log(user);
  //If ok,then send client response
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // console.log(token);
  }
  if (!token) {
    return next(new AppError('You didnt login,please log in', 401));
  }

  // 2) Verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('The user is not exist anymore', 401));
  }

  // Check if user changed password after token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User changed password,please log in again!', 401)
    );
  }

  req.user = freshUser;

  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You dont have a permission', 403));
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on email

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('This user is not exist', 404));
  }

  // Generate random token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send it to user's email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a patch request with your new password and password confirm to ${resetUrl}.\nIf you didn't forget your password,please ignore this email.`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token valid for 10 minutes',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email.Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //If token has not expired and there is new user set the new password

  if (!user) {
    return next(new AppError('Token is invalid or expired'), 400);
  }

  //Update changePassword property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //Log the user in,send JWT

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1)Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  // 2)Check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('This is not a correct password'), 401);
  }

  // 3)If so,update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4)Log in user,send JWT
  createSendToken(user, 200, res);
});
