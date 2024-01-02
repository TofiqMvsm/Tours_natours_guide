const express = require('express');

const router = express.Router();
const {getAllTours,getTour,deleteTour,updateTour,createTour,aliasTopTours, getToursStats, getMonthlyPlan} = require("../controllers/tourController")
const {protect,restrictTo} = require("../controllers/authController")
const reviewRouter = require('../routes/reviewRouter')

// router.param('id',checkId)

router.route('/top-5-cheap').get(aliasTopTours)
router.route('/tours-stats').get(getToursStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)
router  
  .route('/')
  .get(protect,getAllTours)
  .post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect,restrictTo('admin','lead-guide'),deleteTour);

router.use('/:tourId/reviews',reviewRouter)

module.exports = router