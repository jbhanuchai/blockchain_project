import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { abiMap } from './utils/abiMap';
import { contractAddresses } from './utils/deployedContracts';
import { connectWallet } from './utils/walletConnect';
import NavBar from './components/NavBar';
import MyTickets from './components/MyTickets';
import AdminDashboard from './components/AdminDashboard';
import VerifyTicket from './components/VerifyTicket';
import Marketplace from './components/Marketplace';
import MyBadge from './components/MyBadge'; // New component
import ResellTicket from './components/ResellTicket'; // New component
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './index.css';
import { ethers } from 'ethers';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [contracts, setContracts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const wallet = await connectWallet();
        if (wallet) {
          setProvider(wallet.provider);
          setSigner(wallet.signer);
          setUserAddress(wallet.address);

          // Initialize contracts
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
          console.log("Contracts initialized:", contractInstances);
        } else {
          throw new Error("Wallet connection returned null.");
        }
      } catch (err) {
        console.error("Initialization error:", err.message);
        setError(err.message);
        toast.error(`Failed to connect wallet: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h2>Connecting to wallet...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2>Error</h2>
        <p>{error}</p>
        <button
          className="button button-primary"
          onClick={() => {
            setError(null);
            setLoading(true);
            init();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <Router>
      <ToastContainer />
      <NavBar userAddress={userAddress} />
      <div className="container">
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
            <h2>Welcome to the NFT Ticketing System</h2>
            <p>Use the navigation links above to get started.</p>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;