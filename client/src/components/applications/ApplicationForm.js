import React, { useState, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';

const ApplicationForm = ({ jobId, onSuccess }) => {
  const { currentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    proposal: '',
    price: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If not logged in as freelancer, show login prompt
  if (!currentUser || currentUser.role !== 'freelancer') {
    return (
      <div className="bg-gray-100 p-4 rounded text-center">
        <p className="text-gray-700 mb-2">You must be logged in as a freelancer to apply for jobs.</p>
        <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Login</a>
        {' or '}
        <a href="/register" className="text-indigo-600 hover:text-indigo-800 font-medium">Register</a>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.proposal || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await api.post('/api/applications', {
        jobId,
        proposal: formData.proposal,
        price: parseFloat(formData.price)
      });

      // Reset form
      setFormData({
        proposal: '',
        price: ''
      });

      // Callback on success
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting application. Please try again.');
      console.error('Error submitting application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded border border-gray-200">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="proposal" className="block text-sm font-medium text-gray-700 mb-1">
            Your Proposal*
          </label>
          <textarea
            id="proposal"
            name="proposal"
            value={formData.proposal}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe why you're a good fit for this job..."
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Your Price (USD)*
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            min="1"
            step="1"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default ApplicationForm;
