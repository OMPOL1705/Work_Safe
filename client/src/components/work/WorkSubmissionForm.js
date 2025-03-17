import React, { useState, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';

const WorkSubmissionForm = ({ jobId, onSubmitSuccess }) => {
  const { currentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    // Reset uploaded files when new files are selected
    setUploadedFiles([]);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return [];
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await api.post('/api/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      setUploadedFiles(response.data);
      return response.data;
    } catch (err) {
      console.error('Error uploading files:', err);
      throw new Error('Failed to upload files: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // First upload files if any
      let attachments = uploadedFiles;
      if (files.length > 0 && uploadedFiles.length === 0) {
        attachments = await uploadFiles();
      }
      
      // Then create the submission with file URLs
      const res = await api.post('/api/submissions', {
        jobId,
        title: formData.title,
        description: formData.description,
        attachments
      });
      
      console.log('Work submission successful:', res.data);
      
      setFormData({
        title: '',
        description: '',
      });
      setFiles([]);
      setUploadedFiles([]);
      
      if (onSubmitSuccess) {
        onSubmitSuccess(res.data);
      }
      
      alert('Work submitted successfully!');
    } catch (err) {
      console.error('Error submitting work:', err);
      const errorMessage = err.message || 'Unknown error';
      setError('Failed to submit work: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Submit Your Work</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Submission Title*
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description of Work Completed*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label htmlFor="files" className="block text-sm font-medium text-gray-700 mb-1">
            Attach Files (optional)
          </label>
          <input
            type="file"
            id="files"
            multiple
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            You can attach multiple files (images, documents, code)
          </p>
          
          {files.length > 0 && !uploadedFiles.length && (
            <div className="mt-2">
              <button
                type="button"
                onClick={uploadFiles}
                disabled={isUploading}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload files now'}
              </button>
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
          
          {uploadedFiles.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-green-600">Files uploaded successfully:</p>
              <ul className="list-disc pl-5 mt-1 text-sm text-gray-600">
                {uploadedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className={`w-full py-2 px-4 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 ${
            (isSubmitting || isUploading) ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Work'}
        </button>
      </form>
    </div>
  );
};

export default WorkSubmissionForm; 