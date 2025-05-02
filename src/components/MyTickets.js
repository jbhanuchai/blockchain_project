import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const MyTickets = ({ contracts, userAddress }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userAddress) {
      fetchTickets();
    }
  }, [userAddress]);

  const fetchTickets = async () => {
    setLoading(true);
    const ownedTickets = [];
    console.log("Connected wallet:", userAddress);

    for (const [type, contract] of Object.entries(contracts)) {
      try {
        const total = await contract.totalSupply();
        for (let i = 0; i < total; i++) {
          try {
            const owner = await contract.ownerOf(i);
            if (owner.toLowerCase() !== userAddress.toLowerCase()) continue;

            let tokenURI = await contract.tokenURI(i);
            if (!tokenURI || tokenURI.includes("undefined")) continue;
            if (tokenURI.startsWith("ipfs://")) {
              tokenURI = tokenURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
            }

            const metadataRes = await fetch(tokenURI);
            const metadata = await metadataRes.json();

            let price = '0';
            if (type === 'StandardTicket' || type === 'RoyaltyTicket') {
              try {
                const rawPrice = await contract.originalPrices(i);
                price = ethers.utils.formatEther(rawPrice);
              } catch (err) {
                console.warn(`Failed to fetch price for ${type} token ${i}`);
              }
            }

            ownedTickets.push({
              tokenId: i,
              type,
              owner,
              metadata,
              price
            });
          } catch (err) {
            console.warn(`Skipping token ${i} of ${type}`, err.message);
          }
        }
      } catch (err) {
        console.error(`Failed to fetch from contract ${type}`, err);
      }
    }

    setTickets(ownedTickets);
    setLoading(false);
  };

  const handleListForSale = async (ticket) => {
    const resalePrice = prompt("Enter resale price in ETH:");
    if (!resalePrice || isNaN(resalePrice) || parseFloat(resalePrice) <= 0) {
      toast.error("Invalid resale price");
      return;
    }

    try {
      const contract = contracts[ticket.type];
      const priceInWei = ethers.utils.parseEther(resalePrice);
      const tx = await contract.listForSale(ticket.tokenId, priceInWei);
      await tx.wait();
      toast.success("Ticket listed for sale");
      fetchTickets();
    } catch (err) {
      console.error("Listing failed:", err);
      toast.error("Failed to list ticket");
    }
  };

  if (!userAddress) return <p style={{ textAlign: 'center' }}>Connecting to wallet...</p>;

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: 'auto' }}>
      <h2>My Tickets</h2>
      {loading ? (
        <p>Loading...</p>
      ) : tickets.length === 0 ? (
        <p>No tickets found</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '24px' }}>
          {tickets.map((ticket, idx) => (
            <div key={idx} style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: '#f7f7f7' }}>
              <p><strong>Event:</strong> {ticket.metadata?.eventName || 'Unknown'}</p>
              <p><strong>Date:</strong> {ticket.metadata?.date || 'Unknown'}</p>
              <p><strong>Type:</strong> {ticket.type}</p>
              <p><strong>Token ID:</strong> {ticket.tokenId}</p>
              {(ticket.type === 'StandardTicket' || ticket.type === 'RoyaltyTicket') && (
                <>
                  <p><strong>Original Price:</strong> {ticket.price} ETH</p>
                  <button onClick={() => handleListForSale(ticket)}>List for Sale</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
