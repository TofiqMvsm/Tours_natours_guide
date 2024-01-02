/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const slugify = require('slugify');
// eslint-disable-next-line import/no-extraneous-dependencies
const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name : {
      type : String,
      required : [true,"A tour must have a name"],
      unique : true,
      trim : true,
      maxlength : [40,"A name must be less or equal than 40"],
      minlength : [10,"A name must be higher or equal than 10"]
      // validate : [validator.isAlpha,"A tour name must be only contain character"]
    },
    duration : {
      type : Number,
      required : [true,"A tour must have a duration"]
    },
    maxGroupSize : {
      type : Number,
      required : [true,"A tour must have a group size"]
    },
    difficulty : {
      type : String,
      required : [true,"A tour must have a difficulty"],
      enum : {
        values : ["easy","medium","difficult"],
        message : "The difficulty must be only one of them : easy,medium,difficult"
      }
    },
    price : {
      type : Number,
      default : 300
    },
    ratingsAverage : {
      type : Number,
      default : 4.5,
      max : [5,"A tour must have only 5 rating"],
      min : [1,"A tour must have higher or equal than 1 "]
    },
    ratingsQuantity : {
      type : Number,
      default : 0
    },
    slug : String,
    priceDiscount : {
      type : Number,
      validate : {
       validator : 
        function (val) {
          return val < this.price
       },
       message : "The value must  be lower than actual price({VALUE})"
      }
    },
    summary : {
      type:String,
      trim : true,
      required : [true,"A tour must have a summary"]
    },
    imageCover : {
      type : String,
      required : [true, "A tour must have a cover image"]
    },
    images : [String],
    createdAt : {
      type : Date,
      default : Date.now(),
      select : false
    },
    startDates : [Date],
    startLocation : {
      type : {
        type : String,
        default : 'Point',
        enum : ['Point']
      },
      address :String ,
      description : String,
      coordinates : [Number]
    },
    locations : [
      {
        type : {
          type : String,
          default : 'Point',
          enum : ['Point']
        },
        address :String ,
        description : String,
        coordinates : [Number],
        day : Number
      }
    ],
    guides : [
      {
        type : mongoose.Schema.ObjectId,
        ref : "User"
      }
    ],
    secretTours : {
      type : Boolean,
      default : false
    }
   

  },{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
  })

  tourSchema.pre('save',function (next) {
    console.log(this);
    next()
  })
  
  // tourSchema.pre('save',async function(next){
  //   const guidesPromises = this.guides.map((async id=>await User.findById(id)))
  //   this.guides = await Promise.all(guidesPromises)
  //   next()
  // })


  // tourSchema.pre('save',function (next){
  //   this.slug = slugify(this.name,{lower : true})
  //   next()
  // })

  // eslint-disable-next-line prefer-arrow-callback
  // tourSchema.post('save',function (doc,next) {
  //   console.log(doc);
  //   next()
  // })




  //Query Middleware

  tourSchema.pre(/^find/,function (next) {
    this.find({secretTours : {$ne : true}})
    next()
  })


  tourSchema.pre(/^find/,function(next){
    this.populate({
      path : "guides",
      select : "-__v -passwordChangedAt"
    });
    next()
  })


  // eslint-disable-next-line prefer-arrow-callback
  tourSchema.post(/^find/,function (docs,next) {
    // console.log(docs);
    next()
  })



  // Aggregate Middleware

tourSchema.pre('aggregate',function (next) {
  // console.log(this.pipeline());
  this.pipeline().unshift({
    $match : {secretTours : {$ne : true}}
  })
  next()
})
  

  tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
  })

    tourSchema.virtual('reviews',{
      ref : 'Review',
      foreignField : 'tour',
      localField : "_id"
    })

  

  const Tour = mongoose.model("Tour",tourSchema)  


  module.exports = Tour