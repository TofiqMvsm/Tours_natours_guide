const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory')



exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
exports.getMe = factory.getOne(User)

const filterObj = (obj,...allowedFields)=>{
  const newObj = {}
  Object.keys(obj).forEach(el=>{
    if(allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

exports.getIdMiddleware = (req,res,next)=>{
  req.params.id = req.user.id
  next()
}

exports.updateMe = catchAsync(async (req, res, next) => {
  //Create error if the user wants to update his password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates.Please use /updateMyPassword'
      ),
      400
    );
  }

  //Filtered out unwanted fields  
  const filteredBody = filterObj(req.body,'name','email')

  // Update user data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
 
  
  res.status(200).json({
    status: 'success',
    data : {
        user : updatedUser
    } 
  });
});


exports.deleteMe = catchAsync(async (req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id,{active : false})


  res.status(204).json({
    status : "success",
    data : null
  })
})

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'Invalid Route,Try /signUp',
  });
};



