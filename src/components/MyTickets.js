import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const MyTickets = ({ contracts, userAddress }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const allTickets = [];
        for (const [type, contract] of Object.entries(contracts)) {
          const balance = await contract.balanceOf(userAddress);
          for (let i = 0; i < balance.toNumber(); i++) {
            const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
            const tokenURI = await contract.tokenURI(tokenId);
            let metadata;
            try {
              metadata = await (
                await fetch(tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'))
              ).json();
            } catch (fetchError) {
              console.error(`Failed to fetch metadata for token ${tokenId}:`, fetchError);
              metadata = { eventName: 'Unknown', date: 'N/A', price: '0' };
            }
            let price =
              type === 'StandardTicket' || type === 'RoyaltyTicket'
                ? await contract.originalPrices(tokenId)
                : 0;
            price = ethers.utils.formatEther(price);
            allTickets.push({ type, tokenId: tokenId.toString(), metadata, price });
          }
        }
        setTickets(allTickets);
      } catch (err) {
        toast.error('Failed to fetch tickets');
      }
      setLoading(false);
    };
    if (Object.keys(contracts).length && userAddress) fetchTickets();
  }, [contracts, userAddress]);

  return (
    <div className="section">
      <h2>My Tickets</h2>
      {loading && <p className="loading">Loading tickets...</p>}
      {tickets.length === 0 && !loading && <p>No tickets found.</p>}
      <div className="grid">
        {tickets.map((ticket) => (
          <div key={`${ticket.type}-${ticket.tokenId}`} className="card">
            <p><strong>Event:</strong> {ticket.metadata.eventName}</p>
            <p><strong>Date:</strong> {ticket.metadata.date}</p>
            <p><strong>Type:</strong> {ticket.type}</p>
            <p><strong>Token ID:</strong> {ticket.tokenId}</p>
            <p><strong>Price:</strong> {ticket.price} ETH</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTickets;