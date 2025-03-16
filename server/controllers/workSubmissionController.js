const WorkSubmission = require('../models/WorkSubmission');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Submit work for a job
// @route   POST /api/submissions
// @access  Private/Freelancer
const submitWork = async (req, res) => {
  try {
    const { jobId, title, description, attachments } = req.body;
    
    console.log('Received work submission request:', { 
      jobId, 
      title,
      attachmentsType: typeof attachments,
      attachmentsValue: attachments
    });

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Verify user is the freelancer for this job
    if (!job.freelancer || job.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You are not authorized to submit work for this job'
      });
    }

    // Process attachments - ensure it's an array of objects
    let processedAttachments = [];
    if (attachments && Array.isArray(attachments)) {
      processedAttachments = attachments;
    } else if (attachments && typeof attachments === 'string') {
      try {
        // Try to parse if it's a JSON string
        processedAttachments = JSON.parse(attachments);
      } catch (e) {
        console.log('Error parsing attachments:', e);
        processedAttachments = []; // Default to empty array if parsing fails
      }
    }

    // Create work submission
    const submission = await WorkSubmission.create({
      job: jobId,
      freelancer: req.user._id,
      title,
      description,
      attachments: processedAttachments
    });

    // Populate freelancer info
    const populatedSubmission = await WorkSubmission.findById(submission._id)
      .populate('freelancer', 'username email');

    res.status(201).json(populatedSubmission);
  } catch (error) {
    console.error('Error in submitWork controller:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all submissions for a job
// @route   GET /api/submissions/job/:jobId
// @access  Private (Employer or assigned Freelancer)
const getSubmissionsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is authorized to view submissions
    const isEmployer = job.employer.toString() === req.user._id.toString();
    const isFreelancer = job.freelancer && job.freelancer.toString() === req.user._id.toString();
    
    if (!isEmployer && !isFreelancer) {
      return res.status(403).json({ message: 'Not authorized to view these submissions' });
    }

    // Get submissions
    const submissions = await WorkSubmission.find({ job: jobId })
      .populate('freelancer', 'username email')
      .sort('-createdAt');

    res.json(submissions);
  } catch (error) {
    console.error('Error in getSubmissionsByJob controller:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update submission status (approve or request revision)
// @route   PUT /api/submissions/:id
// @access  Private/Employer
const updateSubmissionStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    const submission = await WorkSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Get the job
    const job = await Job.findById(submission.job);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the employer
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this submission' });
    }

    submission.status = status;
    if (feedback) {
      submission.feedback = feedback;
    }
    submission.updatedAt = Date.now();

    const updatedSubmission = await submission.save();

    // If submission is approved, update job status
    if (status === 'approved') {
      job.status = 'completed';
      job.completedAt = Date.now();
      await job.save();
    }

    res.json(updatedSubmission);
  } catch (error) {
    console.error('Error in updateSubmissionStatus controller:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  submitWork,
  getSubmissionsByJob,
  updateSubmissionStatus
}; 