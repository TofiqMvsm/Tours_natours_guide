const stripe = require('stripe')(process.env.STRIPE_SECRETKEY)
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handleFactory'); 

exports.getCheckoutSession = catchAsync(async (req,res,next)=>{
    const tour = await Tour.findById(req.params.tourID)


    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'usd',
              unit_amount: tour.price,
              product_data: {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
              },
            },
          },
        ],
      });

    res.status(200).json({
        status : 'success',
        session
    })

})


exports.createBookingCheckout = catchAsync( async (req,res,next)=>{
  const {tour,user,price} = req.query
  if(!tour || !user || !price) return next()
  await Booking.create({tour,user,price})
  res.redirect(req.originalUrl.split('?')[0])
})



exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBookings = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)