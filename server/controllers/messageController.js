const Message = require('../models/Message');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { jobId, receiverId, content } = req.body;
    
    console.log('Received message request:', { jobId, receiverId, content });

    // Check if all required fields are provided
    if (!jobId || !receiverId || !content) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        received: { jobId, receiverId, content } 
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Verify sender is part of this job
    const isEmployer = job.employer.toString() === req.user._id.toString();
    const isFreelancer = job.freelancer && job.freelancer.toString() === req.user._id.toString();
    
    if (!isEmployer && !isFreelancer) {
      return res.status(403).json({ message: 'Not authorized to send messages for this job' });
    }

    // Create message
    const message = await Message.create({
      job: jobId,
      sender: req.user._id,
      receiver: receiverId,
      content
    });

    // Populate sender info
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email')
      .populate('receiver', 'username email');

    console.log('Message created successfully:', populatedMessage);
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error in sendMessage controller:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get messages for a job
// @route   GET /api/messages/job/:jobId
// @access  Private
const getMessagesByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is part of this conversation
    const isEmployer = job.employer.toString() === req.user._id.toString();
    const isFreelancer = job.freelancer && job.freelancer.toString() === req.user._id.toString();
    
    if (!isEmployer && !isFreelancer) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    // Get messages
    const messages = await Message.find({
      job: jobId,
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender', 'username email')
    .populate('receiver', 'username email')
    .sort('createdAt');

    // Mark messages as read
    await Message.updateMany(
      { job: jobId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error in getMessagesByJob controller:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessagesByJob
}; 