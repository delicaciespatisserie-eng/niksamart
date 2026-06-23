const router = require('express').Router();
const review = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
router.get('/:productId', review.getReviews);
router.post('/:productId', protect, authorize('customer', 'admin'), review.createReview);
module.exports = router;
