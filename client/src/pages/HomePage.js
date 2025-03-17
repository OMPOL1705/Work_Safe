import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const DOMAINS = [
  { id: 'web-development', name: 'Web Development', icon: '💻' },
  { id: 'mobile-development', name: 'Mobile Development', icon: '📱' },
  { id: 'design', name: 'Design & Creative', icon: '🎨' },
  { id: 'writing', name: 'Writing & Content', icon: '✍️' },
  { id: 'marketing', name: 'Marketing', icon: '📢' },
  { id: 'data', name: 'Data Science & Analytics', icon: '📊' }
];

const HomePage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState('all');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/jobs', {
          params: {
            limit: 3,
            domain: selectedDomain !== 'all' ? selectedDomain : undefined
          }
        });
        
        const jobsData = response.data.jobs || [];
        setJobs(jobsData);
        setError(null);
      } catch (err) {
        setError('Failed to load jobs');
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [selectedDomain]);

  const getJobsByDomain = (domainId) => {
    if (!Array.isArray(jobs)) return [];
    return jobs.filter(job => job.domain === domainId).slice(0, 3);
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

  const JobCard = ({ job }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 group-hover:text-indigo-600 transition-colors">
            <Link to={`/jobs/${job._id}`}>
              {job.title}
            </Link>
          </h3>
          <span className={`${getStatusBadgeClass(job.status)} text-xs font-medium px-3 py-1 rounded-full`}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            {job.employer?.username?.charAt(0).toUpperCase()}
          </div>
          <p className="text-gray-600 text-sm">
            Posted by <span className="font-medium">{job.employer?.username}</span>
          </p>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {(job.skills || []).slice(0, 3).map((skill, index) => (
            <span key={index} className="bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1 rounded-full">
              {skill}
            </span>
          ))}
          {(job.skills || []).length > 3 && (
            <span className="text-indigo-500 text-xs font-medium">+{job.skills.length - 3} more</span>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="text-indigo-600 font-semibold text-lg">${job.budget}</div>
          <Link 
            to={`/jobs/${job._id}`} 
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 group-hover:translate-x-1 transition-transform"
          >
            View Details
            <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-indigo-200">
                Freelance Match
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-indigo-100">
              Connect with top talent and find projects that match your skills
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/jobs" 
                className="px-8 py-4 bg-white text-indigo-600 font-medium rounded-full hover:bg-opacity-90 transform hover:-translate-y-0.5 transition-all shadow-lg"
              >
                Find Jobs
              </Link>
              <Link 
                to="/register" 
                className="px-8 py-4 bg-indigo-500 text-white font-medium rounded-full hover:bg-indigo-400 transform hover:-translate-y-0.5 transition-all shadow-lg"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">Browse by Category</h2>
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`px-6 py-3 rounded-full whitespace-nowrap transition-all ${
                selectedDomain === 'all'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Categories
            </button>
            {DOMAINS.map(domain => (
              <button
                key={domain.id}
                onClick={() => setSelectedDomain(domain.id)}
                className={`px-6 py-3 rounded-full whitespace-nowrap transition-all flex items-center space-x-2 ${
                  selectedDomain === domain.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{domain.icon}</span>
                <span>{domain.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-16">
              {selectedDomain === 'all' ? (
                DOMAINS.map(domain => {
                  const domainJobs = getJobsByDomain(domain.id);
                  if (domainJobs.length === 0) return null;

                  return (
                    <div key={domain.id}>
                      <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{domain.icon}</span>
                          <h2 className="text-2xl font-bold text-gray-800">{domain.name}</h2>
                        </div>
                        <Link 
                          to={`/jobs?domain=${domain.id}`} 
                          className="text-indigo-600 hover:text-indigo-500 font-medium flex items-center"
                        >
                          View all jobs
                          <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {domainJobs.map(job => (
                          <JobCard key={job._id} job={job} />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div>
                  {jobs.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">
                            {DOMAINS.find(d => d.id === selectedDomain)?.icon}
                          </span>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {DOMAINS.find(d => d.id === selectedDomain)?.name}
                          </h2>
                        </div>
                        <Link 
                          to={`/jobs?domain=${selectedDomain}`} 
                          className="text-indigo-600 hover:text-indigo-500 font-medium flex items-center"
                        >
                          View all jobs
                          <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {jobs.map(job => (
                          <JobCard key={job._id} job={job} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-xl shadow">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs available</h3>
                      <p className="mt-2 text-gray-500">No jobs are currently available in this category.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors">
                  <span className="text-2xl text-indigo-600">1</span>
                </div>
                <div className="hidden md:block absolute top-8 left-full w-full border-t-2 border-dashed border-indigo-100"></div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Post a Job</h3>
              <p className="text-gray-600 leading-relaxed">
                Describe your project requirements and the skills you're looking for in detail.
              </p>
            </div>
            <div className="text-center group">
              <div className="relative">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors">
                  <span className="text-2xl text-indigo-600">2</span>
                </div>
                <div className="hidden md:block absolute top-8 left-full w-full border-t-2 border-dashed border-indigo-100"></div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Review Applications</h3>
              <p className="text-gray-600 leading-relaxed">
                Compare proposals from talented freelancers and select the best match for your project.
              </p>
            </div>
            <div className="text-center group">
              <div className="relative">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors">
                  <span className="text-2xl text-indigo-600">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Collaborate & Pay</h3>
              <p className="text-gray-600 leading-relaxed">
                Work together seamlessly and process payments securely through our platform.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
