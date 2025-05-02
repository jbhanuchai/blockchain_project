import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { abiMap } from './utils/abiMap';
import { contractAddresses } from './utils/deployedContracts';
import { connectWallet } from './utils/walletConnect';
import Home from './components/Home';
import NavBar from './components/NavBar';
import MyTickets from './components/MyTickets';
import AdminDashboard from './components/AdminDashboard';
import VerifyTicket from './components/VerifyTicket';
import Marketplace from './components/Marketplace';
import MyBadge from './components/MyBadge';
import ResellTicket from './components/ResellTicket';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './index.css';
import { ethers } from 'ethers';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [contracts, setContracts] = useState({});
  const [error, setError] = useState(null);

  const init = async () => {
    try {
      const wallet = await connectWallet();
      if (wallet) {
        setProvider(wallet.provider);
        setSigner(wallet.signer);
        setUserAddress(wallet.address);

        const contractInstances = {
          StandardTicket: new ethers.Contract(
            contractAddresses.StandardTicket,
            abiMap.StandardTicket,
            wallet.signer
          ),
          SoulboundTicket: new ethers.Contract(
            contractAddresses.SoulboundTicket,
            abiMap.SoulboundTicket,
            wallet.signer
          ),
          RoyaltyTicket: new ethers.Contract(
            contractAddresses.RoyaltyTicket,
            abiMap.RoyaltyTicket,
            wallet.signer
          ),
          DynamicTicket: new ethers.Contract(
            contractAddresses.DynamicTicket,
            abiMap.DynamicTicket,
            wallet.signer
          ),
        };

        setContracts(contractInstances);

        // Handle wallet account switching
        window.ethereum?.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setUserAddress(accounts[0]);
          } else {
            setUserAddress('');
          }
        });

        toast.success("Wallet connected successfully!");
      } else {
        throw new Error("Wallet connection failed.");
      }
    } catch (err) {
      console.error("Wallet connection error:", err.message);
      setError(err.message);
      toast.error(`Failed to connect wallet: ${err.message}`);
    }
  };

  return (
    <Router>
      <ToastContainer />
      <NavBar />
      <div className="container">
        {error && (
          <div className="section">
            <h2>Error</h2>
            <p>{error}</p>
            <button
              className="button button-primary"
              onClick={() => {
                setError(null);
                init();
              }}
            >
              Retry
            </button>
          </div>
        )}
        <Switch>
          <Route path="/my-tickets">
            <MyTickets contracts={contracts} userAddress={userAddress} />
          </Route>
          <Route path="/event-status">
            <AdminDashboard contracts={contracts} userAddress={userAddress} />
          </Route>
          <Route path="/verify">
            <VerifyTicket contracts={contracts} />
          </Route>
          <Route path="/buy-ticket">
            <Marketplace contracts={contracts} />
          </Route>
          <Route path="/resell-ticket">
            <ResellTicket contracts={contracts} userAddress={userAddress} />
          </Route>
          <Route path="/my-badge">
            <MyBadge contracts={contracts} userAddress={userAddress} />
          </Route>
          <Route path="/">
            <Home userAddress={userAddress} connectWallet={init} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
