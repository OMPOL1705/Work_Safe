import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import JobCommunication from '../communication/JobCommunication';
import WorkSubmissionForm from './WorkSubmissionForm';
import WorkSubmissionList from './WorkSubmissionList';
import api from '../../utils/api';

const ProjectWorkspace = ({ jobId }) => {
  const { currentUser } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('communication');

  // Fetch job details to get employer and freelancer info
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/api/jobs/${jobId}`);
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
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || 'Job details not found'}
      </div>
    );
  }

  const isEmployer = currentUser?._id === job.employer._id;
  const isFreelancer = currentUser && job.freelancer && 
    currentUser._id === job.freelancer._id.toString();
  const isFreelancerAssigned = Boolean(job.freelancer);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'communication'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('communication')}
          >
            Communication
          </button>
          {isFreelancerAssigned && (
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'submissions'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('submissions')}
            >
              Work Submissions
            </button>
          )}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'communication' && (
          <JobCommunication 
            jobId={jobId} 
            employer={job.employer} 
            freelancer={job.freelancer} 
          />
        )}
        
        {activeTab === 'submissions' && isFreelancerAssigned && (
          <>
            <WorkSubmissionList 
              jobId={jobId} 
              isEmployer={isEmployer} 
            />
            
            {isFreelancer && (
              <div className="mt-8">
                <WorkSubmissionForm 
                  jobId={jobId} 
                  onSubmitSuccess={() => {
                    // Refetch submissions when a new one is added
                    setActiveTab('submissions');
                  }} 
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectWorkspace; 