const router = require('express').Router();
const wishlist = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
router.use(protect, authorize('customer', 'admin'));
router.get('/', wishlist.getWishlist);
router.post('/toggle/:productId', wishlist.toggleWishlist);
module.exports = router;
