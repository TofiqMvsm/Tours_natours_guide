const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on("uncaughtException",err => {
  // console.log(err.message);
  // console.log("Uncaught Expression!");
  process.exit(1)
})

dotenv.config({path:"./config.env"})
const app = require("./app")


const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
  useNewUrlParser : true,
  useCreateIndex : true,
  useFindAndModify : false
}).then(()=>console.log("DB is successful"))



const port = 3000;

const server = app.listen(port, () => {
  console.log('Running on port');
});


process.on('unhandledRejection',err=>{
  console.log(err.message);
  console.log("Unhandled Rejection");
  server.close(()=>{
    process.exit(1)
  })
})

