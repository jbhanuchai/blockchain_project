import React, { useState } from "react";
import { ethers } from "ethers";
import { connectWallet } from "../utils/walletConnect";
import { abiMap } from "../utils/abiMap";
import { contractAddresses } from "../utils/deployedContracts";
import ticketOptions from "../utils/ticketOptions.json";

const BuyTicket = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedTicket, setSelectedTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleConnect = async () => {
    const wallet = await connectWallet();
    if (wallet) {
      setWalletAddress(wallet.address);
    }
  };

  const handleMint = async () => {
    if (!walletAddress) return alert("Connect your wallet.");
    if (!selectedEvent || !selectedTicket) return alert("Select event and ticket type.");

    try {
      setLoading(true);
      setMessage("");

      // Connect and get signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      // Match selected ticket from ticketOptions
      const ticketData = ticketOptions.find(
        (ticket) => ticket.event === selectedEvent && ticket.ticketType === selectedTicket
      );

      if (!ticketData) {
        alert("Invalid ticket selection.");
        setLoading(false);
        return;
      }

      const { ticketModel, metadataURI } = ticketData;
      const abi = abiMap[ticketModel];
      const address = contractAddresses[ticketModel];

      if (!abi || !address) {
        alert("Invalid contract or ABI mapping.");
        setLoading(false);
        return;
      }

      const contract = new ethers.Contract(address, abi, signer);

      console.log("Minting with:", {
        ticketModel,
        to: walletAddress,
        uri: metadataURI,
      });

      let tx;

      if (ticketModel === "RoyaltyTicket") {
        tx = await contract.mintTicket(walletAddress, metadataURI, walletAddress, 500); // 5%
      } else {
        tx = await contract.mintTicket(walletAddress, metadataURI);
      }

      console.log("Transaction sent:", tx.hash);
      setMessage(`Transaction sent. Waiting for confirmation...`);
      await tx.wait();
      console.log("Transaction confirmed:", tx.hash);

      setMessage(`🎉 Ticket minted successfully! Tx Hash: ${tx.hash}`);
    } catch (error) {
      console.error("Mint failed:", error);
      setMessage(`❌ Mint failed: ${error.reason || error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const availableTickets = ticketOptions.filter(ticket => ticket.event === selectedEvent);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Buy a Ticket</h2>

      {!walletAddress ? (
        <button onClick={handleConnect}>Connect Wallet</button>
      ) : (
        <p>Connected: {walletAddress}</p>
      )}

      <div style={{ marginTop: "20px" }}>
        <label>Select Event:</label><br />
        <select
          value={selectedEvent}
          onChange={(e) => {
            setSelectedEvent(e.target.value);
            setSelectedTicket("");
          }}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        >
          <option value="">-- Select Event --</option>
          {[...new Set(ticketOptions.map(ticket => ticket.event))].map(event => (
            <option key={event} value={event}>{event}</option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <div style={{ marginTop: "20px" }}>
          <label>Select Ticket Type:</label><br />
          <select
            value={selectedTicket}
            onChange={(e) => setSelectedTicket(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="">-- Select Ticket Type --</option>
            {availableTickets.map(ticket => (
              <option key={ticket.ticketType} value={ticket.ticketType}>
                {ticket.ticketType}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleMint} disabled={loading || !selectedTicket}>
          {loading ? "Minting..." : "Mint Ticket"}
        </button>
      </div>

      {message && (
        <div style={{ marginTop: "20px", color: message.includes("failed") ? "red" : "green" }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default BuyTicket;
