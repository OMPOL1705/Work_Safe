const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Create a new application
// @route   POST /api/applications
// @access  Private/Freelancer
const createApplication = async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can apply for jobs' });
    }

    const { jobId, proposal, price } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      freelancer: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      job: jobId,
      freelancer: req.user._id,
      proposal,
      price
    });

    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get applications for a job
// @route   GET /api/applications/job/:jobId
// @access  Private/Employer
const getApplicationsByJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the job owner
    if (req.user.role === 'employer' && job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('freelancer', 'username email skills walletAddress');

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get applications by freelancer
// @route   GET /api/applications/me
// @access  Private/Freelancer
const getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can view their applications' });
    }

    const applications = await Application.find({ freelancer: req.user._id })
      .populate('job', 'title description budget deadline status');

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private/Employer
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const application = await Application.findById(req.params.id)
      .populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user is the job owner
    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    const updatedApplication = await application.save();

    // If application is accepted, update job status
    if (status === 'accepted') {
      await Job.findByIdAndUpdate(application.job._id, { status: 'in-progress' });
    }

    res.json(updatedApplication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createApplication,
  getApplicationsByJob,
  getMyApplications,
  updateApplicationStatus,
};
