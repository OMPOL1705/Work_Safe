const Job = require('../models/Job');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private/Employer
const createJob = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can create jobs' });
    }

    const { title, description, skills, budget, deadline, domain } = req.body;

    // Validate domain
    if (!domain) {
      return res.status(400).json({ message: 'Job category is required' });
    }

    const job = new Job({
      title,
      description,
      skills,
      budget,
      deadline,
      domain,
      employer: req.user._id
    });

    console.log('Creating job with data:', job); // Debug log

    const savedJob = await job.save();
    const populatedJob = await savedJob.populate('employer', 'username email');

    res.status(201).json(populatedJob);
  } catch (err) {
    console.error('Error in createJob:', err);
    res.status(500).json({ message: err.message || 'Error creating job' });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const { status, limit, page = 1, domain } = req.query;
    
    const query = {};
    
    // Make status filter optional
    if (status) {
      query.status = status;
    }
    
    if (domain && domain !== 'all') {
      query.domain = domain;
    }
    
    const jobs = await Job.find(query)
      .populate('employer', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 10);
    
    const total = await Job.countDocuments(query);
    
    res.json({
      jobs,
      pagination: {
        total,
        pages: Math.ceil(total / (parseInt(limit) || 10)),
        page: parseInt(page),
        pageSize: parseInt(limit) || 10
      }
    });
  } catch (err) {
    console.error('Error in getJobs:', err);
    res.status(500).json({ 
      jobs: [],
      message: 'Server error' 
    });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'username email')
      .populate('freelancer', 'username email walletAddress');

    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Employer
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the job owner
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const { title, description, skills, budget, deadline, status, freelancer } = req.body;

    // Add these debug logs
    console.log('Updating job with data:', req.body);
    console.log('Current freelancer value:', job.freelancer);
    console.log('New freelancer value:', freelancer);

    // Update fields if provided
    if (title) job.title = title;
    if (description) job.description = description;
    if (skills) job.skills = skills;
    if (budget) job.budget = budget;
    if (deadline) job.deadline = deadline;
    if (status) job.status = status;
    if (freelancer) job.freelancer = freelancer;

    const updatedJob = await job.save();
    
    // Populate the employer and freelancer fields
    await updatedJob.populate('employer', 'username email');
    if (updatedJob.freelancer) {
      await updatedJob.populate('freelancer', 'username email');
    }
    
    console.log('Job updated successfully:', updatedJob);
    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Employer
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the job owner
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    // Use findByIdAndDelete instead of remove()
    await Job.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Job removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
};
