import React, { useState, useContext } from 'react';
import Web3Context from '../../context/Web3Context';
import TransactionReceipt from './TransactionReceipt';

const DemoContractUI = ({ jobId, freelancerAddress }) => {
  const { account } = useContext(Web3Context);
  const [demoState, setDemoState] = useState('AWAITING_PAYMENT');
  const [demoBalance, setDemoBalance] = useState('0.25');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Demo function to simulate funding the contract
  const handleFundContract = async () => {
    setIsProcessing(true);
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setDemoState('AWAITING_DELIVERY');
    setDemoBalance('0.25');
    setIsProcessing(false);
  };
  
  // Demo function to simulate confirming delivery
  const handleConfirmDelivery = async () => {
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would call the smart contract
      // For demo, simulate the blockchain delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate a transaction hash
      const txHash = "0x" + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // Show transaction details
      setTransactionDetails({
        hash: txHash,
        from: account || '0x1234...5678',
        to: freelancerAddress,
        amount: demoBalance,
        timestamp: new Date().toISOString()
      });
      
      // Update contract state
      setDemoState('COMPLETE');
      setDemoBalance('0');
      
      // Show success message
      setSuccessMessage('Payment of 0.25 ETH (test) successfully sent to freelancer!');
      
      // Store the payment info in localStorage for the freelancer wallet demo to pick up
      localStorage.setItem(`job_${jobId}_state`, 'COMPLETE');
      localStorage.setItem(`job_${jobId}_amount`, demoBalance);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Demo function to simulate refund
  const handleRefund = async () => {
    setIsProcessing(true);
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setDemoState('REFUNDED');
    setDemoBalance('0');
    setIsProcessing(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Smart Contract (Demo)</h3>
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
          Demo Mode - No Real Money
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Contract Status</p>
          <p className={`font-medium ${
            demoState === 'COMPLETE' ? 'text-green-600' : 
            demoState === 'REFUNDED' ? 'text-red-600' : 'text-blue-600'
          }`}>
            {demoState === 'AWAITING_PAYMENT' ? 'Awaiting Payment' :
             demoState === 'AWAITING_DELIVERY' ? 'In Progress' :
             demoState === 'COMPLETE' ? 'Completed' : 'Refunded'}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Contract Balance</p>
          <p className="font-medium">{demoBalance} ETH (Test)</p>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-md mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Contract Participants</h4>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <p className="text-xs text-gray-500">Employer (You)</p>
            <p className="text-xs font-mono break-all">{account || '0x1234...5678'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Freelancer</p>
            <p className="text-xs font-mono break-all">{freelancerAddress || '0x8765...4321'}</p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        {demoState === 'AWAITING_PAYMENT' && (
          <button
            onClick={handleFundContract}
            disabled={isProcessing}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Fund Contract (0.25 Test ETH)'}
          </button>
        )}
        
        {demoState === 'AWAITING_DELIVERY' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Waiting for the freelancer to complete the work...
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleRefund}
                disabled={isProcessing}
                className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Refund Payment'}
              </button>
              <button
                onClick={handleConfirmDelivery}
                disabled={isProcessing}
                className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Release Payment'}
              </button>
            </div>
          </div>
        )}
        
        {demoState === 'COMPLETE' && (
          <div className="p-3 bg-green-50 text-green-800 rounded-md">
            <p className="font-medium">✓ Payment Released</p>
            <p className="text-sm mt-1">
              The freelancer has received 0.25 ETH (test currency) for completing this job.
            </p>
          </div>
        )}
        
        {demoState === 'REFUNDED' && (
          <div className="p-3 bg-red-50 text-red-800 rounded-md">
            <p className="font-medium">✓ Payment Refunded</p>
            <p className="text-sm mt-1">
              Your 0.25 ETH (test currency) has been refunded to your wallet.
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-xs text-gray-500 italic">
        Note: This is a demonstration of blockchain integration. No real currency is used.
      </div>
      
      {successMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{successMessage}</span>
          <button
            onClick={() => setShowReceipt(true)}
            className="ml-2 underline text-green-800 hover:text-green-900"
          >
            View Receipt
          </button>
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </button>
        </div>
      )}
      
      {showReceipt && transactionDetails && (
        <TransactionReceipt 
          transaction={transactionDetails} 
          onClose={() => setShowReceipt(false)} 
        />
      )}
    </div>
  );
};

export default DemoContractUI; 