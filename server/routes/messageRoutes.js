const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessagesByJob
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, sendMessage);

router.get('/job/:jobId', protect, getMessagesByJob);

module.exports = router; 