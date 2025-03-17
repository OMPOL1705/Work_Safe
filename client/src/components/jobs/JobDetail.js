import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import ApplicationForm from '../applications/ApplicationForm';
import ApplicationList from '../applications/ApplicationList';
import ProjectWorkspace from '../work/ProjectWorkspace';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/jobs/${id}`);
        setJob(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to load job details');
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleJobDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      await api.delete(`/api/jobs/${id}`);
      navigate('/jobs');
    } catch (err) {
      setError('Failed to delete job. ' + (err.response?.data?.message || 'Please try again.'));
      console.error('Error deleting job:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center">
          <svg className="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-700">{error || 'Job not found'}</span>
        </div>
      </div>
    );
  }

  const isEmployer = currentUser && job.employer._id === currentUser._id;
  const isFreelancer = currentUser && currentUser.role === 'freelancer';

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-green-100 text-green-800 border-green-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'completed': 'bg-purple-100 text-purple-800 border-purple-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{job.employer.username}</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatDate(job.deadline)}</span>
                </div>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <nav className="flex px-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-6 font-medium border-b-2 -mb-px ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Job Details
            </button>
            {job.status === 'in-progress' && (
              <button
                onClick={() => setActiveTab('workspace')}
                className={`py-4 px-6 font-medium border-b-2 -mb-px ${
                  activeTab === 'workspace'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Project Workspace
              </button>
            )}
            {isEmployer && job.status === 'open' && (
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-6 font-medium border-b-2 -mb-px ${
                  activeTab === 'applications'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Applications
              </button>
            )}
          </nav>
        </div>

        {/* Content Sections */}
        <div className="p-8">
          {activeTab === 'details' && (
            <div className="space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {job.description}
                </p>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1.5 rounded-full border border-indigo-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Budget</h3>
                    <p className="text-gray-600">Fixed Price</p>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">
                    ${job.budget.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-200">
                {isEmployer && job.status === 'open' && (
                  <button 
                    onClick={handleJobDelete}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Job
                  </button>
                )}
              </div>

              {/* Application Form */}
              {isFreelancer && job.status === 'open' && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-xl font-semibold mb-4">Apply for this job</h3>
                  <ApplicationForm jobId={job._id} onSuccess={() => alert('Application submitted successfully!')} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'workspace' && job.status === 'in-progress' && (
            <ProjectWorkspace jobId={job._id} />
          )}

          {activeTab === 'applications' && isEmployer && job.status === 'open' && (
            <ApplicationList jobId={job._id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;