import React, { useContext } from 'react';
import Web3Context from '../../context/Web3Context';

const NetworkSelector = () => {
  const { networkId, switchToTestnet } = useContext(Web3Context);
  
  const networks = {
    11155111: 'Sepolia Testnet',
    5: 'Goerli Testnet',
    80001: 'Mumbai Testnet (Polygon)',
    1337: 'Local Development Network'
  };
  
  return (
    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-indigo-800">Network:</p>
          <p className="text-sm text-indigo-600">
            {networks[networkId] || 'Unknown Network'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Demo Mode (No Real Money)</p>
        </div>
        <button
          onClick={switchToTestnet}
          className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
        >
          Switch to Testnet
        </button>
      </div>
    </div>
  );
};

export default NetworkSelector; 