import React, { useState, useEffect } from 'react';

const Notification = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  if (!isVisible) return null;
  
  const bgColor = type === 'success' ? 'bg-green-100 border-green-500' : 
                 type === 'error' ? 'bg-red-100 border-red-500' :
                 'bg-blue-100 border-blue-500';
                 
  const textColor = type === 'success' ? 'text-green-800' : 
                   type === 'error' ? 'text-red-800' :
                   'text-blue-800';
  
  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border-l-4 ${bgColor} ${textColor} z-50`}>
      <div className="flex items-center">
        {type === 'success' && (
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        {type === 'error' && (
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Notification; 