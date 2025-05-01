import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const ResellTicket = ({ contracts, userAddress }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resellPrices, setResellPrices] = useState({}); // To store input prices for reselling

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const allTickets = [];
        for (const [type, contract] of Object.entries(contracts)) {
          if (type !== 'StandardTicket' && type !== 'RoyaltyTicket') continue; // Only resellable tickets
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
            const price = ethers.utils.formatEther(await contract.originalPrices(tokenId));
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

  const listForSale = async (type, tokenId, price) => {
    try {
      const contract = contracts[type];
      const tx = await contract.listForSale(tokenId, ethers.utils.parseEther(price));
      await tx.wait();
      toast.success('Ticket listed for sale');
      // Refresh tickets after listing
      fetchTickets();
    } catch (err) {
      toast.error('Failed to list ticket');
      console.error(err);
    }
  };

  const handlePriceChange = (tokenId, price) => {
    setResellPrices((prev) => ({ ...prev, [tokenId]: price }));
  };

  return (
    <div className="section">
      <h2>Resell Tickets</h2>
      {loading && <p className="loading">Loading tickets...</p>}
      {tickets.length === 0 && !loading && <p>No resellable tickets found.</p>}
      <div className="grid">
        {tickets.map((ticket) => (
          <div key={`${ticket.type}-${ticket.tokenId}`} className="card">
            <p><strong>Event:</strong> {ticket.metadata.eventName}</p>
            <p><strong>Date:</strong> {ticket.metadata.date}</p>
            <p><strong>Type:</strong> {ticket.type}</p>
            <p><strong>Token ID:</strong> {ticket.tokenId}</p>
            <p><strong>Original Price:</strong> {ticket.price} ETH</p>
            <input
              className="input"
              type="text"
              placeholder="Resell Price (ETH)"
              value={resellPrices[ticket.tokenId] || ''}
              onChange={(e) => handlePriceChange(ticket.tokenId, e.target.value)}
            />
            <button
              className="button button-primary"
              onClick={() => listForSale(ticket.type, ticket.tokenId, resellPrices[ticket.tokenId] || '0.5')}
            >
              List for Sale
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResellTicket;