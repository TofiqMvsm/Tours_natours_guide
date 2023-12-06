// Variable Declares
const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

const app = express();
const toursRouter = require('./routes/tourRouter')
const usersRouter = require('./routes/userRouter')
//MiddleWares
if(process.env.NODE_ENV === "development"){
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});
app.use(express.json());
app.use(express.static(`${__dirname}/public`))




//Routes

app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);


app.all('*',(req,res,next)=>{

  next(new AppError(`Cant find ${req.originalUrl} on this server`,404))
})


app.use(globalErrorHandler)


module.exports = app