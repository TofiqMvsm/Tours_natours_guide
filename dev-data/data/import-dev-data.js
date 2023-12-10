const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });



// Database

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB is successful'));



//Read File
  const tours =JSON.parse(fs.readFileSync(`${__dirname}/tours.json`))


// Import Data
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data loaded successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit()
};


// Delete Data
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit()
};


if(process.argv[2] === "--import"){
    importData()
}
else if(process.argv[2] === "--delete"){
    deleteData()
}


console.log(process.argv);
