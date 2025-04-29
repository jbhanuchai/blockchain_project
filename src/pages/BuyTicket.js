import React, { useState } from "react";
import { connectWallet } from "../utils/walletConnect";

const BuyTicket = () => {
  const [walletAddress, setWalletAddress] = useState(null);

  const handleConnect = async () => {
    const wallet = await connectWallet();
    if (wallet) {
      setWalletAddress(wallet.address);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Buy Ticket</h2>
      {!walletAddress ? (
        <button onClick={handleConnect}>Connect Wallet to Continue</button>
      ) : (
        <p>Connected: {walletAddress}</p>
      )}
    </div>
  );
};

export default BuyTicket;
