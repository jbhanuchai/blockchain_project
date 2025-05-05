import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { getMetadata } from '../utils/getMetadata';

// This component shows all tickets owned by the current user
const MyTickets = ({ contracts, userAddress }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resalePrice, setResalePrice] = useState('');
  const [submitting, setSubmitting] = useState(false); // Controls submit button loading state

  // Fetch tickets when user address changes
  useEffect(() => {
    if (userAddress) {
      fetchTickets();
    }
  }, [userAddress]);

  // Get all tickets owned by the user across contract types
  const fetchTickets = async () => {
    setLoading(true);
    const ownedTickets = [];

    for (const [type, contract] of Object.entries(contracts)) {
      try {
        const total = await contract.totalSupply();
        for (let i = 0; i < total; i++) {
          try {
            const owner = await contract.ownerOf(i);
            if (owner.toLowerCase() !== userAddress.toLowerCase()) continue;

            let tokenURI = await contract.tokenURI(i);
            if (!tokenURI || tokenURI.includes("undefined")) continue;

            const metadata = await getMetadata(tokenURI, `${type}-${i}`);

            let price = '0';
            let isListed = false;
            let listingPrice = '';

            // Handle price and listing logic for Standard and Royalty tickets
            if (type === 'StandardTicket' || type === 'RoyaltyTicket') {
              try {
                const rawPrice = await contract.originalPrices(i);
                price = ethers.utils.formatEther(rawPrice);

                const listedPrice = await contract.ticketListings(i);
                if (listedPrice.gt(0)) {
                  isListed = true;
                  listingPrice = ethers.utils.formatEther(listedPrice);
                }
              } catch (err) {
                console.warn(`Failed to fetch price or listing for ${type} token ${i}`);
              }
            }

            ownedTickets.push({
              tokenId: i,
              type,
              owner,
              metadata,
              price,
              isListed,
              listingPrice
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

  // Opens modal to list ticket for resale
  const openModal = (ticket) => {
    setSelectedTicket(ticket);
    setResalePrice(ticket.listingPrice || '');
    setShowModal(true);
  };

  // Submit resale listing to the blockchain
  const handleResaleSubmit = async () => {
    if (!resalePrice || isNaN(resalePrice) || parseFloat(resalePrice) <= 0.001) {
      toast.error("Price must be at least 0.001 ETH");
      return;
    }

    setSubmitting(true);
    try {
      const contract = contracts[selectedTicket.type];
      const tokenId = selectedTicket.tokenId;
      const priceInWei = ethers.utils.parseEther(resalePrice);

      // Check if royalty fee exceeds listing price
      if (selectedTicket.type === 'RoyaltyTicket') {
        const [, royaltyAmount] = await contract.royaltyInfo(tokenId, priceInWei);
        if (royaltyAmount.gte(priceInWei)) {
          toast.error("Royalty is greater than or equal to resale price");
          setSubmitting(false);
          return;
        }
      }

      const tx = await contract.listForSale(tokenId, priceInWei);
      toast.info("Transaction submitted...");
      await tx.wait();
      toast.success("Ticket listed for sale");
      setShowModal(false);
      fetchTickets();
    } catch (err) {
      console.error("Listing failed:", err);
      toast.error("Failed to list ticket");
    } finally {
      setSubmitting(false);
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
                  {ticket.isListed && (
                    <p><strong>Listed:</strong> {ticket.listingPrice} ETH</p>
                  )}
                  <button onClick={() => openModal(ticket)}>
                    {ticket.isListed ? "Edit Listing" : "List for Sale"}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3>Set Resale Price (ETH)</h3>
            <input
              type="number"
              step="0.0001"
              value={resalePrice}
              onChange={(e) => setResalePrice(e.target.value)}
              placeholder="Enter price"
              style={{ marginBottom: '16px', padding: '8px', width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button onClick={handleResaleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal overlay styling
const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0,
  width: '100%', height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

// Modal box styling
const modalStyle = {
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '8px',
  width: '300px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
};

export default MyTickets;
