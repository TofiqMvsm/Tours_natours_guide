const express = require('express');

const router = express.Router();
const {getAllTours,getTour,deleteTour,updateTour,createTour,aliasTopTours, getToursStats, getMonthlyPlan, getToursWithin, getTourDistance,resizeTourImages,uploadTourImages} = require("../controllers/tourController")
const {protect,restrictTo} = require("../controllers/authController")
const reviewRouter = require('../routes/reviewRouter')

// router.param('id',checkId)

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin)
router.route('/distance/:latlng/unit/:unit').get(getTourDistance)

router.route('/top-5-cheap').get(aliasTopTours)
router.route('/tours-stats').get(getToursStats)
router.route('/monthly-plan/:year').get(protect,restrictTo('admin','lead-guide','guide'),getMonthlyPlan)
router  
  .route('/')
  .get(getAllTours)
  .post(protect,restrictTo('admin','lead-guide'),createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(protect,restrictTo('admin','lead-guide'),uploadTourImages,resizeTourImages,updateTour)
  .delete(protect,restrictTo('admin','lead-guide'),deleteTour);

router.use('/:tourId/reviews',reviewRouter)

module.exports = router