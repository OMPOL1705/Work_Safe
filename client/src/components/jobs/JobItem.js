import React from 'react';
import { Link } from 'react-router-dom';

const JobItem = ({ job }) => {
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Truncate description
  const truncateDescription = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between">
        <h3 className="text-xl font-semibold">
          <Link to={`/jobs/${job._id}`} className="text-indigo-600 hover:text-indigo-800">
            {job.title}
          </Link>
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>
      </div>
      
      <div className="mt-2">
        <p className="text-gray-600">{truncateDescription(job.description)}</p>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {job.skills.map((skill, index) => (
          <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {skill}
          </span>
        ))}
      </div>
      
      <div className="mt-4 flex justify-between text-sm text-gray-500">
        <div>
          <span className="font-medium text-gray-900">${job.budget}</span> Budget
        </div>
        <div>
          <span className="font-medium">Deadline:</span> {formatDate(job.deadline)}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="text-sm">
          <span className="text-gray-500">Posted by:</span> <span className="font-medium">{job.employer?.username || 'Unknown'}</span>
        </div>
        
        <Link 
          to={`/jobs/${job._id}`} 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default JobItem;
