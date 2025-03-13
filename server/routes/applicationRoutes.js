const express = require('express');
const router = express.Router();
const {
  createApplication,
  getApplicationsByJob,
  getMyApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createApplication);

router.get('/me', protect, getMyApplications);
router.get('/job/:jobId', protect, getApplicationsByJob);
router.put('/:id', protect, updateApplicationStatus);

module.exports = router;
