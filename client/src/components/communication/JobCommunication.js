import React, { useState, useEffect, useRef, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';

const JobCommunication = ({ jobId, employer, freelancer }) => {
  const { currentUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Safely determine the recipient - moved before any conditional returns
  const getReceiverId = () => {
    if (!currentUser || !employer || !freelancer) return null;
    return currentUser._id === employer._id ? freelancer._id : employer._id;
  };
  
  const receiverId = getReceiverId();

  // All hooks must be called before any conditional returns
  useEffect(() => {
    const fetchMessages = async () => {
      if (!jobId || !freelancer) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const res = await api.get(`/api/messages/job/${jobId}`);
        setMessages(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to load messages');
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Poll for new messages if we have a freelancer
    if (jobId && freelancer) {
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [jobId, freelancer]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !receiverId) {
      if (!receiverId) {
        setError('Cannot send message: recipient not available');
      }
      return;
    }
    
    try {
      const res = await api.post('/api/messages', {
        jobId,
        receiverId,
        content: newMessage
      });
      
      setMessages([...messages, res.data]);
      setNewMessage('');
      setError(null);
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  // Now we can have conditional rendering
  if (!freelancer) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <p className="text-yellow-600 mb-3">
          No freelancer has been assigned to this job yet.
        </p>
        <p className="text-gray-600">
          Communication will be available once a freelancer is selected.
        </p>
      </div>
    );
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-indigo-600 text-white">
        <h3 className="text-lg font-semibold">Project Communication</h3>
        <p className="text-sm text-indigo-100">
          {currentUser?._id === employer._id 
            ? `You are messaging: ${freelancer.username}`
            : `You are messaging: ${employer.username}`}
        </p>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 border-b border-red-200">
          {error}
        </div>
      )}
      
      <div className="p-4 h-80 overflow-y-auto flex flex-col space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message._id}
              className={`max-w-3/4 p-3 rounded-lg ${
                message.sender._id === currentUser?._id
                  ? 'bg-indigo-100 ml-auto'
                  : 'bg-gray-100'
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">
                {message.sender.username} • {new Date(message.createdAt).toLocaleString()}
              </div>
              <div className="text-gray-800">{message.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            disabled={!receiverId}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobCommunication; 