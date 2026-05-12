const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { patchDocument } = require('../controllers/patchController');

// PATCH /api/edit/:resource/:id
// body: { field: 'name', value: 'Rohan Sharma' }
router.patch('/:resource/:id', protect, patchDocument);

module.exports = router;
