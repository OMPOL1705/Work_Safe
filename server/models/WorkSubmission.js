const mongoose = require('mongoose');

// Define the schema for an attachment
const AttachmentSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String
});

const WorkSubmissionSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  attachments: [AttachmentSchema], // Use a defined schema for attachments
  status: {
    type: String,
    enum: ['submitted', 'revision_requested', 'approved'],
    default: 'submitted'
  },
  feedback: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WorkSubmission', WorkSubmissionSchema); 