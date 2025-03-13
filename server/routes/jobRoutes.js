const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getJobs)
  .post(protect, createJob);

router.route('/:id')
  .get(getJobById)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

module.exports = router;
