import React, { createContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import { jobEscrowABI } from '../utils/contracts';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default testnet settings
  const defaultNetwork = {
    name: "Sepolia Test Network",
    chainId: "0xaa36a7", // 11155111 in hex
    rpcUrl: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161" // Public Infura endpoint
  };

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
          });

          // Listen for chain changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });

          // Get network ID
          const networkId = await web3Instance.eth.net.getId();
          setNetworkId(networkId);

          setLoading(false);
        } catch (error) {
          setError('Please allow access to connect to MetaMask');
          setLoading(false);
        }
      } else {
        setError('Please install MetaMask to use blockchain features');
        setLoading(false);
      }
    };

    initWeb3();
  }, []);

  // Create a contract instance
  const getContractInstance = (contractAddress) => {
    if (!web3) return null;
    return new web3.eth.Contract(jobEscrowABI, contractAddress);
  };

  // Deploy a new escrow contract
  const deployEscrowContract = async (freelancerAddress, jobId, amount) => {
    if (!web3 || !account) {
      setError('Web3 or account not initialized');
      return null;
    }

    try {
      // Create contract instance
      const jobEscrowContract = new web3.eth.Contract(jobEscrowABI);
      
      // Deploy contract
      const deployTx = await jobEscrowContract.deploy({
        data: process.env.REACT_APP_JOB_ESCROW_BYTECODE, // Add bytecode to env variables
        arguments: [freelancerAddress, jobId]
      }).send({
        from: account,
        value: web3.utils.toWei(amount.toString(), 'ether'),
        gas: 2000000
      });

      return deployTx.options.address;
    } catch (error) {
      console.error('Error deploying contract:', error);
      setError('Failed to deploy contract: ' + error.message);
      return null;
    }
  };

  // Interact with existing contract
  const confirmDelivery = async (contractAddress) => {
    if (!web3 || !account) {
      setError('Web3 or account not initialized');
      return false;
    }

    try {
      const contract = getContractInstance(contractAddress);
      await contract.methods.confirmDelivery().send({ from: account });
      return true;
    } catch (error) {
      console.error('Error confirming delivery:', error);
      setError('Failed to confirm delivery: ' + error.message);
      return false;
    }
  };

  // Refund escrow
  const refundEscrow = async (contractAddress) => {
    if (!web3 || !account) {
      setError('Web3 or account not initialized');
      return false;
    }

    try {
      const contract = getContractInstance(contractAddress);
      await contract.methods.refund().send({ from: account });
      return true;
    } catch (error) {
      console.error('Error refunding escrow:', error);
      setError('Failed to refund: ' + error.message);
      return false;
    }
  };

  // Get contract state
  const getContractState = async (contractAddress) => {
    if (!web3) {
      setError('Web3 not initialized');
      return null;
    }

    try {
      const contract = getContractInstance(contractAddress);
      const state = await contract.methods.state().call();
      const employer = await contract.methods.employer().call();
      const freelancer = await contract.methods.freelancer().call();
      const amount = await contract.methods.amount().call();
      const balance = await web3.eth.getBalance(contractAddress);

      return {
        state: parseInt(state),
        employer,
        freelancer,
        amount: web3.utils.fromWei(amount, 'ether'),
        balance: web3.utils.fromWei(balance, 'ether')
      };
    } catch (error) {
      console.error('Error getting contract state:', error);
      setError('Failed to get contract state: ' + error.message);
      return null;
    }
  };

  // Connect wallet manually
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        return true;
      } catch (error) {
        setError('User denied account access');
        return false;
      }
    } else {
      setError('Please install MetaMask');
      return false;
    }
  };

  // Switch to testnet
  const switchToTestnet = async () => {
    if (!window.ethereum) return false;
    
    try {
      // Try to switch to the testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: defaultNetwork.chainId }],
      });
      return true;
    } catch (switchError) {
      // If the network doesn't exist in MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: defaultNetwork.chainId,
                chainName: defaultNetwork.name,
                rpcUrls: [defaultNetwork.rpcUrl],
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'SEP',
                  decimals: 18
                },
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      return false;
    }
  };

  // Clear errors
  const clearError = () => setError(null);

  return (
    <Web3Context.Provider
      value={{
        web3,
        account,
        networkId,
        loading,
        error,
        getContractInstance,
        deployEscrowContract,
        confirmDelivery,
        refundEscrow,
        getContractState,
        connectWallet,
        switchToTestnet,
        clearError,
        // Demo mode flag
        isDemoMode: true
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;
