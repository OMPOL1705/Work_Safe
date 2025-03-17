import React from 'react';

const TransactionReceipt = ({ transaction, onClose }) => {
  if (!transaction) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
        
        <h3 className="text-lg font-bold mb-4">Payment Confirmation</h3>
        
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <div className="flex items-center text-green-700">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Payment Successfully Sent!</span>
          </div>
        </div>
        
        <div className="space-y-3 mb-6 text-sm">
          <div>
            <span className="text-gray-500">Amount:</span> 
            <span className="font-medium ml-2">{transaction.amount} ETH (Test)</span>
          </div>
          
          <div>
            <span className="text-gray-500">From:</span> 
            <div className="font-mono text-xs break-all mt-1">{transaction.from}</div>
          </div>
          
          <div>
            <span className="text-gray-500">To (Freelancer):</span> 
            <div className="font-mono text-xs break-all mt-1">{transaction.to}</div>
          </div>
          
          <div>
            <span className="text-gray-500">Transaction Hash:</span> 
            <div className="font-mono text-xs break-all mt-1">{transaction.hash}</div>
          </div>
          
          <div>
            <span className="text-gray-500">Time:</span> 
            <span className="ml-2">{new Date(transaction.timestamp).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="mt-4 border-t border-gray-200 pt-4">
          <button
            onClick={() => {
              window.open(`https://sepolia.etherscan.io/tx/${transaction.hash}`, '_blank');
            }}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            View on Etherscan (Demo)
          </button>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            This is a demo transaction. In a real blockchain system, you would be able to view the transaction details on a block explorer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt; 