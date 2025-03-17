import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Web3Context from '../context/Web3Context';
import api from '../utils/api';

const ProfilePage = () => {
  const { currentUser, updateProfile } = useContext(AuthContext);
  const { account, connectWallet } = useContext(Web3Context);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    skills: '',
    bio: '',
    walletAddress: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        skills: currentUser.skills ? currentUser.skills.join(', ') : '',
        bio: currentUser.bio || '',
        walletAddress: currentUser.walletAddress || ''
      });
      
      fetchUserData();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      setLoadingData(true);
      
      if (currentUser.role === 'freelancer') {
        // Fetch freelancer's applications
        const res = await api.get('/api/applications/me');
        setApplications(res.data);
      } else if (currentUser.role === 'employer') {
        // Fetch employer's jobs
        const res = await api.get('/api/jobs');
        const userJobs = res.data.filter(job => job.employer._id === currentUser._id);
        setJobs(userJobs);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Format skills as array if freelancer
      const userData = {
        ...formData,
        skills: currentUser.role === 'freelancer' && formData.skills 
          ? formData.skills.split(',').map(skill => skill.trim()) 
          : []
      };
      
      const success = await updateProfile(userData);
      
      if (success) {
        setIsEditing(false);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error updating profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalletConnect = async () => {
    const connected = await connectWallet();
    
    if (connected && account) {
      setFormData({ ...formData, walletAddress: account });
      
      if (currentUser.walletAddress !== account) {
        // Update wallet address in profile
        await updateProfile({ walletAddress: account });
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!currentUser) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Profile Info */}
      <div className="md:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Profile</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Edit
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {currentUser.role === 'freelancer' && (
                <div className="mb-4">
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="React, Node.js, Web3, Solidity"
                  />
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="mb-6">
                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Ethereum Wallet Address
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="walletAddress"
                    name="walletAddress"
                    value={formData.walletAddress}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0x..."
                  />
                  <button
                    type="button"
                    onClick={handleWalletConnect}
                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-r-md hover:bg-gray-300"
                  >
                    Connect
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Username</h3>
                <p className="mt-1">{currentUser.username}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{currentUser.email}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <p className="mt-1 capitalize">{currentUser.role}</p>
              </div>

              {currentUser.role === 'freelancer' && currentUser.skills && currentUser.skills.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Skills</h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {currentUser.skills.map((skill, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentUser.bio && (
                                <div className="mb-4">
                                <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                                <p className="mt-1">{currentUser.bio}</p>
                              </div>
                            )}
              
                            {currentUser.walletAddress && (
                              <div className="mb-4">
                                <h3 className="text-sm font-medium text-gray-500">Ethereum Wallet</h3>
                                <p className="mt-1 text-xs break-all">{currentUser.walletAddress}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
              
                    {/* Activity Section */}
                    <div className="md:col-span-2">
                      {/* Freelancer Applications */}
                      {currentUser.role === 'freelancer' && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                          <h2 className="text-xl font-bold mb-6">My Job Applications</h2>
                          
                          {loadingData ? (
                            <div className="flex justify-center items-center h-24">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                          ) : applications.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded">
                              <p className="text-gray-500">You haven't applied to any jobs yet</p>
                              <Link to="/jobs" className="mt-2 inline-block text-indigo-600 hover:text-indigo-800">
                                Browse available jobs
                              </Link>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {applications.map(app => (
                                <div key={app._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-start">
                                    <h3 className="font-medium">
                                      <Link to={`/jobs/${app.job._id}`} className="text-indigo-600 hover:text-indigo-800">
                                        {app.job.title}
                                      </Link>
                                    </h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      app.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                      app.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </span>
                                  </div>
                                  
                                  <p className="text-sm text-gray-500 mt-1">Applied on {formatDate(app.createdAt)}</p>
                                  
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-700">Your proposal:</p>
                                    <p className="text-sm mt-1">{app.proposal}</p>
                                  </div>
                                  
                                  <div className="mt-2 flex justify-between">
                                    <p className="text-sm">
                                      <span className="text-gray-500">Your bid:</span> ${app.price}
                                    </p>
                                    
                                    <Link to={`/jobs/${app.job._id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                      View Job
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Employer Jobs */}
                      {currentUser.role === 'employer' && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">My Job Postings</h2>
                            <Link 
                              to="/create-job" 
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md"
                            >
                              Post a New Job
                            </Link>
                          </div>
                          
                          {loadingData ? (
                            <div className="flex justify-center items-center h-24">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                          ) : jobs.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded">
                              <p className="text-gray-500">You haven't posted any jobs yet</p>
                              <Link to="/create-job" className="mt-2 inline-block text-indigo-600 hover:text-indigo-800">
                                Post your first job
                              </Link>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {jobs.map(job => (
                                <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-start">
                                    <h3 className="font-medium">
                                      <Link to={`/jobs/${job._id}`} className="text-indigo-600 hover:text-indigo-800">
                                        {job.title}
                                      </Link>
                                    </h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      job.status === 'open' ? 'bg-green-100 text-green-800' : 
                                      job.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                                      job.status === 'completed' ? 'bg-purple-100 text-purple-800' : 
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                    </span>
                                  </div>
                                  
                                  <p className="text-sm text-gray-500 mt-1">Posted on {formatDate(job.createdAt)}</p>
                                  
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {job.skills.map((skill, idx) => (
                                      <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                  
                                  <div className="mt-2 flex justify-between">
                                    <p className="text-sm">
                                      <span className="text-gray-500">Budget:</span> ${job.budget}
                                    </p>
                                    
                                    <Link to={`/jobs/${job._id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                      Manage Job
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              };
              
              export default ProfilePage;