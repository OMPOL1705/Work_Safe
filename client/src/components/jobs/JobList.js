import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';

const DOMAINS = [
  { id: 'web-development', name: 'Web Development', icon: '💻' },
  { id: 'mobile-development', name: 'Mobile Development', icon: '📱' },
  { id: 'design', name: 'Design & Creative', icon: '🎨' },
  { id: 'writing', name: 'Writing & Content', icon: '✍️' },
  { id: 'marketing', name: 'Marketing', icon: '📢' },
  { id: 'data', name: 'Data Science & Analytics', icon: '📊' }
];

const JobList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(searchParams.get('domain') || 'all');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/jobs', {
          params: {
            domain: selectedDomain !== 'all' ? selectedDomain : undefined
          }
        });
        setJobs(response.data.jobs || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [selectedDomain]);

  const handleDomainChange = (domain) => {
    setSelectedDomain(domain);
    if (domain === 'all') {
      searchParams.delete('domain');
    } else {
      searchParams.set('domain', domain);
    }
    setSearchParams(searchParams);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Domain Filter Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Filter by Category</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleDomainChange('all')}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedDomain === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {DOMAINS.map(domain => (
            <button
              key={domain.id}
              onClick={() => handleDomainChange(domain.id)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedDomain === domain.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {domain.icon} {domain.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {selectedDomain === 'all' 
              ? 'All Jobs' 
              : `${DOMAINS.find(d => d.id === selectedDomain)?.name} Jobs`}
          </h2>
          <p className="text-gray-600">
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No jobs found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <div key={job._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">
                      <Link to={`/jobs/${job._id}`} className="hover:text-indigo-600">
                        {job.title}
                      </Link>
                    </h3>
                    <span className={`${getStatusBadgeClass(job.status)} text-xs font-medium px-2.5 py-0.5 rounded`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">
                    Posted by {job.employer?.username || 'Anonymous'}
                  </p>
                  <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(job.skills || []).slice(0, 3).map((skill, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                    {(job.skills || []).length > 3 && (
                      <span className="text-gray-500 text-xs">+{job.skills.length - 3} more</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-indigo-600 font-medium">${job.budget}</div>
                    <Link to={`/jobs/${job._id}`} className="text-sm text-indigo-600 hover:text-indigo-500">
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;