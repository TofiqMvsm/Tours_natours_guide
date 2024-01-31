const multer = require('multer');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory')
const sharp = require('sharp');



// const multerStorage = multer.diskStorage({
//   destination : (req,file,cb)=>{
//     cb(null,'public/image/users')
//   },
//   filename : (req,file,cb)=>{
//     const ext = file.mimetype.split('/')[1]
//     cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })

const multerStorage = multer.memoryStorage()

const multerFilter = (req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null,true)
  }else{
    cb(new AppError('Not an image!Please provide image',400),false)
  }
}


const upload = multer({
  storage : multerStorage,
  fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo')


exports.resizeUserPhoto = (req,res,next)=>{
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

  if(!req.file) return next()
  sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/image/users/${req.file.filename}`)
next()
}

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
  if(req.file) filteredBody.photo = req.file.filename
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



