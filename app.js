// Variable Declares
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const AppError = require('./utils/appError')
const helmet = require('helmet')
const app = express();
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')



const globalErrorHandler = require('./controllers/errorController')
const toursRouter = require('./routes/tourRouter')
const usersRouter = require('./routes/userRouter')
const reviewRouter = require('./routes/reviewRouter')
const bookingRouter = require('./routes/bookingRouter')




app.set('view engine','pug')
app.set('views',path.join(__dirname,'views'))   
//Serving static files
app.use(express.static(path.join(__dirname,'public')))
//MiddleWares

if(process.env.NODE_ENV === "development"){
  app.use(morgan('dev'));
}

//Set security http headers
app.use(helmet())


//Limit the request
const limiter = rateLimit({
  max : 100,
  windowMs : 60 * 60 * 1000,
  message : "Too many request from this IP address.Please try again a one hour later!"

})

app.use(limiter)


//Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});


//Body parser, reading data from the body
app.use(express.json({limit : '10kb'}));


//Data sanitization against NoSql query injection
app.use(mongoSanitize())


//Data sanitization agains XSS
app.use(xss())


//Prevent parametr pollution
app.use(hpp({
  whitelist : ["duration","ratingsAverage","ratingsQuantity","maxGroupSize","price","difficulty"]
}));







app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews',reviewRouter)
app.use('/api/v1/bookings',bookingRouter)


app.all('*',(req,res,next)=>{

  next(new AppError(`Cant find ${req.originalUrl} on this server`,404))
})


app.use(globalErrorHandler)


module.exports = app