import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { getCachedMetadata } from '../utils/ipfsHelpers';

// Marketplace component - displays listed tickets for purchase
const Marketplace = ({ contracts }) => {
  const [listedTickets, setListedTickets] = useState([]); // List of tickets available for resale
  const [loading, setLoading] = useState(false);          // UI state while fetching
  const [buyingTokenId, setBuyingTokenId] = useState(null); // Tracks which token is being purchased

  // Fetch all tickets that are currently listed for sale
  const fetchListedTickets = async () => {
    setLoading(true);
    const tickets = [];

    for (const [type, contract] of Object.entries(contracts)) {
      // Only fetch from ticket types that support resale
      if (type !== 'StandardTicket' && type !== 'RoyaltyTicket') continue;

      try {
        const total = await contract.totalSupply();

        for (let tokenId = 0; tokenId < total; tokenId++) {
          try {
            // Get the resale price
            const price = await contract.ticketListings(tokenId);
            if (price.gt(0)) {
              let uri;
              try {
                uri = await contract.tokenURI(tokenId);
                if (!uri || uri.includes("undefined")) continue;
              } catch (err) {
                console.warn(`Token ${tokenId} might not exist yet:`, err);
                continue;
              }

              // Extract CID from IPFS URI format
              let cid;
              if (uri.startsWith("ipfs://")) {
                cid = uri.split("ipfs://")[1];
              } else if (uri.includes("/ipfs/")) {
                cid = uri.split("/ipfs/")[1];
              } else {
                console.warn(`Unrecognized URI format for token ${tokenId}:`, uri);
                continue;
              }

              // Try loading metadata from IPFS cache
              const cacheKey = `${type}-${tokenId}`;
              let metadata;
              try {
                metadata = await getCachedMetadata(cacheKey, cid);
              } catch (err) {
                console.warn(`Failed to fetch metadata for ${cacheKey}`, err);
                metadata = { eventName: "Unknown", date: "N/A" };
              }

              // Add to display list
              tickets.push({
                type,
                tokenId,
                price: ethers.utils.formatEther(price),
                metadata,
                label: "Resold"
              });
            }
          } catch (err) {
            console.warn(`Skipping token ${tokenId} in ${type}`, err);
            continue;
          }
        }
      } catch (err) {
        console.error(`Failed to process contract: ${type}`, err);
      }
    }

    setListedTickets(tickets);
    setLoading(false);
  };

  // Auto-fetch when contracts are loaded
  useEffect(() => {
    if (Object.keys(contracts).length) {
      fetchListedTickets();
    }
  }, [contracts]);

  // Executes the purchase transaction
  const buyTicket = async (type, tokenId, price) => {
    const key = `${type}-${tokenId}`;
    setBuyingTokenId(key);
    const txToast = toast.loading("Transaction in progress...");
    try {
      const tx = await contracts[type].buyTicket(tokenId, {
        value: ethers.utils.parseEther(price)
      });
      await tx.wait();

      toast.update(txToast, {
        render: "Ticket purchased!",
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      fetchListedTickets(); // Refresh after purchase
    } catch (err) {
      console.error("Purchase failed:", err);
      toast.update(txToast, {
        render: "Transaction failed.",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setBuyingTokenId(null);
    }
  };

  return (
    <div className="section">
      <h2>Marketplace</h2>
      {loading && <p className="loading">Loading tickets...</p>}
      {!loading && listedTickets.length === 0 && <p>No tickets listed for sale.</p>}

      <div className="grid">
        {listedTickets.map((ticket) => {
          const isProcessing = buyingTokenId === `${ticket.type}-${ticket.tokenId}`;
          return (
            <div key={`${ticket.type}-${ticket.tokenId}`} className="card">
              <p><strong>Event:</strong> {ticket.metadata.eventName}</p>
              <p><strong>Date:</strong> {ticket.metadata.date}</p>
              <p><strong>Type:</strong> {ticket.type}</p>
              <p><strong>Token ID:</strong> {ticket.tokenId}</p>
              <p><strong>Price:</strong> {ticket.price} ETH</p>
              {ticket.label && <p className="label">{ticket.label}</p>}
              <button
                disabled={isProcessing}
                onClick={() => buyTicket(ticket.type, ticket.tokenId, ticket.price)}
              >
                {isProcessing ? "Processing..." : "Buy Ticket"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Marketplace;
