import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const Marketplace = ({ contracts }) => {
  const [listedTickets, setListedTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchListedTickets = async () => {
      setLoading(true);
      try {
        const allTickets = [];
        for (const [type, contract] of Object.entries(contracts)) {
          if (type !== 'StandardTicket' && type !== 'RoyaltyTicket') continue;
          for (let tokenId = 0; tokenId < 10; tokenId++) {
            try {
              const price = await contract.ticketListings(tokenId);
              if (price.gt(0)) {
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
                allTickets.push({
                  type,
                  tokenId,
                  price: ethers.utils.formatEther(price),
                  metadata,
                });
              }
            } catch (err) {
              // Token not listed or doesn't exist
            }
          }
        }
        setListedTickets(allTickets);
      } catch (err) {
        toast.error('Failed to fetch listed tickets');
      }
      setLoading(false);
    };
    if (Object.keys(contracts).length) fetchListedTickets();
  }, [contracts]);

  const buyTicket = async (type, tokenId, price) => {
    try {
      const contract = contracts[type];
      const tx = await contract.buyTicket(tokenId, { value: ethers.utils.parseEther(price) });
      await tx.wait();
      toast.success('Ticket purchased');
      fetchListedTickets();
    } catch (err) {
      toast.error('Failed to buy ticket');
    }
  };

  return (
    <div className="section">
      <h2>Marketplace</h2>
      {loading && <p className="loading">Loading tickets...</p>}
      {listedTickets.length === 0 && !loading && <p>No tickets listed for sale.</p>}
      <div className="grid">
        {listedTickets.map((ticket) => (
          <div key={`${ticket.type}-${ticket.tokenId}`} className="card">
            <p><strong>Event:</strong> {ticket.metadata.eventName}</p>
            <p><strong>Type:</strong> {ticket.type}</p>
            <p><strong>Token ID:</strong> {ticket.tokenId}</p>
            <p><strong>Price:</strong> {ticket.price} ETH</p>
            <button
              className="button button-secondary"
              onClick={() => buyTicket(ticket.type, tokenId, ticket.price)}
            >
              Buy Ticket
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;