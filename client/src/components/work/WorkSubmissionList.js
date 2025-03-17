import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';

const WorkSubmissionList = ({ jobId, isEmployer }) => {
  const { currentUser } = useContext(AuthContext);
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [activeFeedbackId, setActiveFeedbackId] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/submissions/job/${jobId}`);
        setSubmissions(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to load submissions');
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [jobId]);

  const handleStatusUpdate = async (submissionId, status) => {
    try {
      const data = { status };
      
      if (status === 'revision_requested' && feedback) {
        data.feedback = feedback;
      }
      
      const res = await api.put(`/api/submissions/${submissionId}`, data);
      
      // Update local state
      setSubmissions(submissions.map(sub => 
        sub._id === submissionId ? res.data : sub
      ));
      
      setFeedback('');
      setActiveFeedbackId(null);
      
      if (status === 'approved') {
        alert('Work approved! The job has been marked as completed.');
      }
    } catch (err) {
      setError('Failed to update submission status');
      console.error('Error updating submission status:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
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

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No work submissions yet</p>
        {!isEmployer && (
          <p className="mt-2 text-sm text-gray-500">
            Submit your completed work to receive payment
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {submissions.map((submission) => (
        <div 
          key={submission._id} 
          className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
            submission.status === 'approved' ? 'border-green-500' :
            submission.status === 'revision_requested' ? 'border-yellow-500' :
            'border-indigo-500'
          }`}
        >
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h4 className="font-medium">{submission.title}</h4>
              <p className="text-sm text-gray-500">
                Submitted on {formatDate(submission.createdAt)}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              submission.status === 'approved' ? 'bg-green-100 text-green-800' :
              submission.status === 'revision_requested' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {submission.status === 'approved' ? 'Approved' :
               submission.status === 'revision_requested' ? 'Revision Requested' :
               'Pending Review'}
            </span>
          </div>
          
          <div className="p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-1">Description:</h5>
            <p className="mb-4 text-gray-600 whitespace-pre-line">{submission.description}</p>
            
            {submission.attachments && submission.attachments.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h5>
                <div className="flex flex-wrap gap-3">
                  {submission.attachments.map((file, idx) => (
                    <div key={idx} className="relative group">
                      {file.type && file.type.startsWith('image/') ? (
                        // Image preview
                        <a 
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img 
                            src={file.url} 
                            alt={file.name}
                            className="h-24 w-auto object-cover rounded border border-gray-200 hover:border-indigo-500 transition"
                          />
                          <span className="text-xs text-gray-500 mt-1 block truncate max-w-[100px]">
                            {file.name}
                          </span>
                        </a>
                      ) : (
                        // Non-image file
                        <a 
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center p-3 bg-gray-100 rounded border border-gray-200 hover:bg-gray-200 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-xs text-gray-500 mt-1 block truncate max-w-[100px]">
                            {file.name}
                          </span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {submission.feedback && (
              <div className={`p-3 rounded-md ${
                submission.status === 'revision_requested'
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-green-50 border border-green-200'
              }`}>
                <h5 className="text-sm font-medium mb-1">
                  {submission.status === 'revision_requested' ? 'Revision Request:' : 'Feedback:'}
                </h5>
                <p className="text-sm">{submission.feedback}</p>
              </div>
            )}
            
            {isEmployer && submission.status === 'submitted' && (
              <div className="mt-4 flex flex-col space-y-3">
                {activeFeedbackId === submission._id ? (
                  <>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback or revision requests..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows="3"
                    ></textarea>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setActiveFeedbackId(null)}
                        className="px-3 py-1 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(submission._id, 'revision_requested')}
                        className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                      >
                        Request Revision
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setActiveFeedbackId(submission._id)}
                      className="px-4 py-2 border border-yellow-500 text-yellow-700 rounded hover:bg-yellow-50"
                    >
                      Request Revision
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(submission._id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve Work
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkSubmissionList; 