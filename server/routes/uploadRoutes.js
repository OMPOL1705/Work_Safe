const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const path = require('path');

// @route   POST /api/uploads
// @desc    Upload files
// @access  Private
router.post('/', protect, upload.array('files', 5), (req, res) => {
  try {
    // Get server base URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Process uploaded files
    const uploadedFiles = req.files.map(file => ({
      name: file.originalname,
      url: `${baseUrl}/uploads/${file.filename}`,
      type: file.mimetype
    }));
    
    res.json(uploadedFiles);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Error uploading files', error: error.message });
  }
});

module.exports = router; 