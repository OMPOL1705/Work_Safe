import React, { useState, useEffect } from 'react';

const FreelancerWalletDemo = ({ jobId, initialBalance = "1.25" }) => {
  const [balance, setBalance] = useState(initialBalance);
  const [transactions, setTransactions] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  
  // Simulate receiving a payment
  const simulatePaymentReceived = (amount) => {
    // Update balance
    setBalance(prev => {
      const newBalance = (parseFloat(prev) + parseFloat(amount)).toFixed(2);
      return newBalance;
    });
    
    // Add transaction to history
    setTransactions(prev => [
      {
        type: 'received',
        amount,
        from: 'Employer',
        timestamp: new Date().toISOString(),
        jobId
      },
      ...prev
    ]);
    
    // Show notification
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };
  
  // Listen for contract state changes from localStorage (for demo)
  useEffect(() => {
    const checkForPayment = () => {
      const storedState = localStorage.getItem(`job_${jobId}_state`);
      if (storedState === 'COMPLETE') {
        const amount = localStorage.getItem(`job_${jobId}_amount`) || '0.25';
        simulatePaymentReceived(amount);
        // Clear the flag so we don't process twice
        localStorage.removeItem(`job_${jobId}_state`);
      }
    };
    
    // Check initially
    checkForPayment();
    
    // Set up interval to check periodically
    const interval = setInterval(checkForPayment, 2000);
    return () => clearInterval(interval);
  }, [jobId]);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <h3 className="text-lg font-medium mb-2">Freelancer Wallet (Demo)</h3>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="text-xl font-bold">{balance} ETH (Test)</p>
        </div>
        
        {showNotification && (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            Payment Received! +0.25 ETH
          </div>
        )}
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Transactions</h4>
        {transactions.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {transactions.map((tx, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600 font-medium">+{tx.amount} ETH</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(tx.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600 text-xs mt-1">
                  From: {tx.from} • Job: {tx.jobId}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No recent transactions</p>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-400 italic">
        This is a demo wallet for illustration purposes only.
      </div>
    </div>
  );
};

export default FreelancerWalletDemo; 