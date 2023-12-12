const mongoose = require('mongoose')



const reviewSchema = new mongoose.Schema({
    review : {
        type : String,
        required : [true,"A review shouldn't be empty"]
    },
    rating : {
        type : Number,
        max : 5,
        min : 1
    },
    createdAt : {
        type : Date,
        default : Date.now(),
      },
      tour : {
        ref : "Tour",
        type : mongoose.Schema.ObjectId,
        required : [true,"A review must belong to Tour"]
      },
      user : {
        ref : "User",
        type : mongoose.Schema.ObjectId,
        required : [true,"A review must belong to User"]
     }
},{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
  })


const Review = mongoose.model("Review",reviewSchema)  


  module.exports = Review   