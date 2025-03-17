import React, { useContext } from 'react';
import Web3Context from '../../context/Web3Context';

const TestnetFaucet = () => {
  const { account, networkId } = useContext(Web3Context);
  
  const faucets = {
    11155111: 'https://sepoliafaucet.com/',
    5: 'https://goerlifaucet.com/',
    80001: 'https://faucet.polygon.technology/'
  };
  
  if (!account) return null;
  
  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
      <h3 className="text-lg font-medium text-blue-800 mb-2">Demo Mode: Get Test ETH</h3>
      <p className="text-sm text-gray-600 mb-3">
        This project uses test cryptocurrency with no real value. To try out the blockchain features, 
        you'll need some test ETH in your wallet.
      </p>
      
      {faucets[networkId] ? (
        <a 
          href={faucets[networkId]} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          Get Free Test ETH
        </a>
      ) : (
        <p className="text-sm text-red-600">
          Please switch to a supported test network first.
        </p>
      )}
      
      <p className="text-xs text-gray-500 mt-3">
        Your wallet address: {account}
      </p>
    </div>
  );
};

export default TestnetFaucet; 