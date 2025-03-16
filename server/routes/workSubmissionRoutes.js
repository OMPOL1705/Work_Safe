const express = require('express');
const router = express.Router();
const {
  submitWork,
  getSubmissionsByJob,
  updateSubmissionStatus
} = require('../controllers/workSubmissionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, submitWork);

router.route('/job/:jobId')
  .get(protect, getSubmissionsByJob);

router.route('/:id')
  .put(protect, updateSubmissionStatus);

module.exports = router; 