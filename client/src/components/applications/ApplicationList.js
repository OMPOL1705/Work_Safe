import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const ApplicationList = ({ jobId }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingApp, setProcessingApp] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('recommended');
  const [sortedApplications, setSortedApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/applications/job/${jobId}`);
        setApplications(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to load applications');
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [jobId]);

  // Sort applications based on criteria
  useEffect(() => {
    if (!applications.length) return;
    
    let sorted = [...applications];
    
    // Only sort pending applications
    const pendingApps = sorted.filter(app => app.status === 'pending');
    const otherApps = sorted.filter(app => app.status !== 'pending');
    
    switch(sortCriteria) {
      case 'price-low':
        pendingApps.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        pendingApps.sort((a, b) => b.price - a.price);
        break;
      case 'skills':
        pendingApps.sort((a, b) => (b.freelancer?.skills?.length || 0) - (a.freelancer?.skills?.length || 0));
        break;
      case 'recommended':
        // Simple recommendation algorithm (balance of skills and price)
        pendingApps.sort((a, b) => {
          const skillsA = a.freelancer?.skills?.length || 0;
          const skillsB = b.freelancer?.skills?.length || 0;
          const priceA = a.price;
          const priceB = b.price;
          
          // Calculate a score (higher is better)
          // Give more weight to skills (multiplied by 10) and subtract a small factor for price
          const scoreA = skillsA * 10 - (priceA / 20);
          const scoreB = skillsB * 10 - (priceB / 20);
          
          return scoreB - scoreA; // Sort highest score first
        });
        break;
      default:
        // Default - keep original order
        break;
    }
    
    setSortedApplications([...pendingApps, ...otherApps]);
  }, [applications, sortCriteria]);

  const handleAccept = async (application) => {
    try {
      setProcessingApp(application._id);
      
      // 1. Update application status
      await api.put(`/api/applications/${application._id}`, { status: 'accepted' });
      
      // 2. Update job status to in-progress and set freelancer
      await api.put(`/api/jobs/${jobId}`, { 
        status: 'in-progress',
        freelancer: application.freelancer._id
      });
      
      // 3. Update local state
      setApplications(applications.map(app => 
        app._id === application._id 
          ? { ...app, status: 'accepted' } 
          : { ...app, status: app.status === 'pending' ? 'rejected' : app.status }
      ));
      
      alert('Application accepted! You can now communicate with the freelancer.');
      
      // 4. Redirect to job detail page to show the communication interface
      navigate(`/jobs/${jobId}`);
    } catch (err) {
      console.error('Error accepting application:', err);
      alert('Error accepting application: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessingApp(null);
    }
  };

  const handleReject = async (applicationId) => {
    try {
      setProcessingApp(applicationId);
      await api.put(`/api/applications/${applicationId}`, { status: 'rejected' });
      
      // Update local state
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status: 'rejected' } : app
      ));
    } catch (err) {
      console.error('Error rejecting application:', err);
      alert('Error rejecting application');
    } finally {
      setProcessingApp(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded">
        <p className="text-gray-500">No applications yet</p>
      </div>
    );
  }

  const pendingApplications = applications.filter(app => app.status === 'pending');

  return (
    <div>
      {pendingApplications.length > 0 && (
        <div className="mb-6 bg-white p-4 rounded shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-3">Find the Best Candidate</h3>
          
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort by:
          </label>
          <select 
            value={sortCriteria} 
            onChange={(e) => setSortCriteria(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md mb-4"
          >
            <option value="recommended">AI Recommended (Skills & Price Balance)</option>
            <option value="price-low">Lowest Price</option>
            <option value="price-high">Highest Price</option>
            <option value="skills">Most Skills</option>
          </select>
          
          {sortCriteria === 'recommended' && pendingApplications.length > 0 && (
            <div className="bg-green-50 p-3 rounded-md border border-green-200 mt-2">
              <p className="text-sm text-green-800">
                <span className="font-medium">💡 AI Recommendation:</span> The top candidate has been identified based on a balance of skills and price.
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {sortedApplications.map((app, index) => (
          <div 
            key={app._id} 
            className={`bg-gray-50 p-4 rounded border ${
              app.status === 'pending' && sortCriteria === 'recommended' && index === 0 
                ? 'border-green-500 shadow-md' 
                : 'border-gray-200'
            }`}
          >
            {app.status === 'pending' && sortCriteria === 'recommended' && index === 0 && (
              <div className="mb-3 bg-green-50 text-green-800 text-sm px-3 py-1 rounded-md inline-block">
                ⭐ Top Match Candidate
              </div>
            )}
            
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{app.freelancer.username}</h4>
                <p className="text-sm text-gray-500">{app.freelancer.email}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">${app.price}</p>
                {app.status !== 'pending' && (
                  <span className={`text-sm ${
                    app.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-2">
              <h5 className="text-sm font-medium text-gray-700">Skills:</h5>
              <div className="flex flex-wrap gap-1 mt-1">
                {app.freelancer.skills.map((skill, idx) => (
                  <span key={idx} className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-3">
              <h5 className="text-sm font-medium text-gray-700">Proposal:</h5>
              <p className="text-gray-600 mt-1 text-sm">{app.proposal}</p>
            </div>
            
            {app.status === 'pending' && (
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => handleReject(app._id)}
                  disabled={processingApp === app._id}
                  className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAccept(app)}
                  disabled={processingApp === app._id}
                  className={`px-3 py-1 ${
                    sortCriteria === 'recommended' && index === 0
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white rounded text-sm`}
                >
                  {processingApp === app._id ? 'Processing...' : 'Accept Candidate'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationList;
