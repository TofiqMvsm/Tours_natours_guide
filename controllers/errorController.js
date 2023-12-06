
const AppError = require("../utils/appError")

const handleCastErr = err =>{
  const message = `Invalid ${err.path} ${err.value}`
  return new AppError(message,400)
}



const handleJWTerr = () => new AppError("Invalid token.Please log in again!",401)
const handleJWTExpireToken = () => new AppError("Your token was expired,Please log in again!",401)

const handleDuplicateErr = err =>{
  const value = Object.values(err.keyValue)[0]
  const message = `Duplicate field value : ${value}.Please use another one`
  return new AppError(message,400)
}


const handleValidErr = err=>{
  const value = Object.values(err.errors).map(el => el.message)
  const message = `Invalid input data : ${value.join('. ')}`
  return new AppError(message,400)
}

const sendDevErr = (err,res)=>{
  res.status(err.statusCode).json({
    status : err.status,
    message : err.message,
    stack : err.stack,
    error : err
  })
}


const sendProdErr = (err,res) =>{
  if(err.isOperational){
    res.status(err.statusCode).json({
      status : err.status,
      message : err.message
    })
  }else{
//Log error
console.error('Error',err)

// Send message
    res.status(500).json({
      status : 'error',
      message : 'Something went wrong'
    })
  }

}

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
  
  
   if(process.env.NODE_ENV === 'development'){
   sendDevErr(err,res)
   }else if(process.env.NODE_ENV ==='production'){
    // eslint-disable-next-line prefer-const, node/no-unsupported-features/es-syntax
    let error = {...err}
    if(err.name === "JsonWebTokenError") error = handleJWTerr(error)
    if(error.name === 'TokenExpiredError') error = handleJWTExpireToken(error)
    if(err.name  === 'CastError') error = handleCastErr(error)
    if(err.code === 11000) error = handleDuplicateErr(error)
    if(err.name === "ValidationError") error = handleValidErr(error)
   
    sendProdErr(error,res)
   }
  
  
    next()
  }