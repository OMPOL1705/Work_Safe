import React from 'react';

const WalletInstructions = () => {
  return (
    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
      <h3 className="text-lg font-medium mb-3">Setting Up MetaMask for Demo</h3>
      
      <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
        <li>
          <span className="font-medium">Install MetaMask:</span>{' '}
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Download from metamask.io
          </a>
        </li>
        <li>
          <span className="font-medium">Create a wallet</span> or import an existing one (this is just for demo purposes, so you can create a new one)
        </li>
        <li>
          <span className="font-medium">Connect to Sepolia Testnet</span> using the "Switch to Testnet" button above
        </li>
        <li>
          <span className="font-medium">Get free test ETH</span> from one of the faucets to try out the blockchain features
        </li>
      </ol>
      
      <div className="mt-4 text-xs text-gray-500">
        Note: MetaMask is a cryptocurrency wallet that allows you to interact with blockchain applications.
        For this demo, we're using test networks where the cryptocurrency has no real value.
      </div>
    </div>
  );
};

export default WalletInstructions; 