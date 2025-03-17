import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import JobList from '../components/jobs/JobList';

const JobsPage = () => {
  const [keyword, setKeyword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchTerm); // This will trigger the JobList to update with search results
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl mb-8 p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your Next Opportunity
          </h1>
          <p className="text-indigo-100 mb-8">
            Browse through thousands of jobs posted by top employers
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center bg-white rounded-full shadow-lg p-1">
              <input
                type="text"
                placeholder="Search jobs by skill, title, or keyword..."
                className="flex-grow px-6 py-3 rounded-full text-gray-800 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-500 transition-colors duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Available Jobs</h2>
          {keyword && (
            <p className="text-gray-500 text-sm">
              Showing results for "{keyword}"
            </p>
          )}
        </div>
        <Link 
          to="/create-job" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full transition-colors duration-200 flex items-center"
        >
          <span className="mr-2">Post a Job</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>

      {/* Job List */}
      <div className="bg-white rounded-xl shadow-md">
        <JobList keyword={keyword} />
      </div>
    </div>
  );
};

export default JobsPage;
