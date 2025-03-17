import React, { useState, useEffect, useContext } from 'react';
import Web3Context from '../../context/Web3Context';
import api from '../../utils/api';

const ContractInteraction = ({ contractAddress, jobId, isEmployer, jobStatus }) => {
  const { getContractState, confirmDelivery, refundEscrow, account } = useContext(Web3Context);
  
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  // States for the contract
  // 0: AWAITING_PAYMENT, 1: AWAITING_DELIVERY, 2: COMPLETE, 3: REFUNDED
  const contractStates = ['Awaiting Payment', 'In Progress', 'Completed', 'Refunded'];

  useEffect(() => {
    const fetchContractState = async () => {
      try {
        if (!contractAddress) return;
        
        const data = await getContractState(contractAddress);
        setContractData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load contract data');
        console.error('Error fetching contract state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContractState();
    // Polling for updates every 10 seconds
    const interval = setInterval(fetchContractState, 10000);
    return () => clearInterval(interval);
  }, [contractAddress, getContractState]);

  const handleConfirmDelivery = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      const success = await confirmDelivery(contractAddress);
      
      if (success) {
        // Update job status in database
        await api.put(`/api/jobs/${jobId}`, { status: 'completed' });
        
        // Update local contract data
        setContractData({ ...contractData, state: 2 });
        alert('Payment released successfully!');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      setError('Failed to confirm delivery: ' + err.message);
      console.error('Error confirming delivery:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRefund = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      const success = await refundEscrow(contractAddress);
      
      if (success) {
        // Update job status in database
        await api.put(`/api/jobs/${jobId}`, { status: 'cancelled' });
        
        // Update local contract data
        setContractData({ ...contractData, state: 3 });
        alert('Refund processed successfully!');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      setError('Failed to process refund: ' + err.message);
      console.error('Error processing refund:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 p-4 rounded border border-gray-200">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error || !contractData) {
    return (
      <div className="bg-red-50 p-4 rounded border border-red-200">
        <p className="text-red-600">{error || 'Contract data unavailable'}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Contract Status</p>
          <p className={`font-medium ${
            contractData.state === 2 ? 'text-green-600' : 
            contractData.state === 3 ? 'text-red-600' : 'text-blue-600'
          }`}>
            {contractStates[contractData.state]}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Contract Balance</p>
          <p className="font-medium">{contractData.balance} ETH</p>
        </div>
      </div>
      
      <div className="mt-4 border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-500">Freelancer Address</p>
        <p className="font-medium text-xs break-all">{contractData.freelancer}</p>
        
        <p className="text-sm text-gray-500 mt-2">Employer Address</p>
        <p className="font-medium text-xs break-all">{contractData.employer}</p>
      </div>
      
      {/* Action buttons only show if wallet connected matches employer */}
      {isEmployer && account && account.toLowerCase() === contractData.employer.toLowerCase() && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          {contractData.state === 1 && ( // AWAITING_DELIVERY state
            <div className="flex space-x-3">
              <button
                onClick={handleRefund}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Request Refund'}
              </button>
              
              <button
                onClick={handleConfirmDelivery}
                disabled={processing}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Release Payment'}
              </button>
            </div>
          )}
          
          {contractData.state === 2 && <p className="text-green-600">Payment has been released to the freelancer.</p>}
          {contractData.state === 3 && <p className="text-red-600">Funds have been refunded to you.</p>}
        </div>
      )}
    </div>
  );
};

export default ContractInteraction;
