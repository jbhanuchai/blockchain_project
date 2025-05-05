import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import QRCode from 'react-qr-code';

// MyBadge displays Soulbound badges owned by the connected user
const MyBadge = ({ contracts, userAddress }) => {
  const [badges, setBadges] = useState([]); // Stores user's Soulbound tokens
  const [loading, setLoading] = useState(true); // Loading state for fetching

  // Fetch badges once the userAddress is available
  useEffect(() => {
    if (userAddress) {
      fetchBadges();
    }
  }, [userAddress]);

  // Fetch all Soulbound tokens owned by the connected user
  const fetchBadges = async () => {
    setLoading(true);
    const contract = contracts['SoulboundTicket'];
    const ownedBadges = [];

    try {
      const total = await contract.totalSupply(); // Get total minted badges

      for (let i = 0; i < total; i++) {
        try {
          const ownerAddress = await contract.ownerOf(i);

          // Skip if the badge does not belong to the current user
          if (ownerAddress.toLowerCase() !== userAddress.toLowerCase()) continue;

          const tokenURI = await contract.tokenURI(i);
          if (!tokenURI || tokenURI.includes("undefined")) continue;

          // Normalize the IPFS URL
          const ipfsURL = tokenURI.startsWith('ipfs://')
            ? `https://gateway.pinata.cloud/ipfs/${tokenURI.split('ipfs://')[1]}`
            : tokenURI;

          const res = await fetch(ipfsURL);
          const metadata = await res.json();

          ownedBadges.push({
            tokenId: i,
            eventName: metadata.eventName || 'N/A',
            date: metadata.date || 'N/A',
            owner: ownerAddress
          });
        } catch (err) {
          console.warn(`Skipping badge ${i}:`, err.message);
        }
      }

      setBadges(ownedBadges); // Store all fetched badges
    } catch (err) {
      console.error("Failed to fetch badges:", err);
      toast.error("Error fetching your badges");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: 'auto' }}>
      <h2>My Badges</h2>

      {/* Loading or empty state */}
      {loading ? (
        <p>Loading...</p>
      ) : badges.length === 0 ? (
        <p>No badges found.</p>
      ) : (
        // Display owned badges
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '24px' }}>
          {badges.map((badge, idx) => (
            <div key={idx} style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: '#f7f7f7' }}>
              <p><strong>Event:</strong> {badge.eventName}</p>
              <p><strong>Date:</strong> {badge.date}</p>
              <p><strong>Token ID:</strong> {badge.tokenId}</p>
              <p><strong>Type:</strong> Soulbound</p>

              {/* QR code includes contract, token ID, and owner address */}
              <QRCode
                value={JSON.stringify({
                  contract: contracts['SoulboundTicket'].address,
                  tokenId: badge.tokenId,
                  owner: badge.owner
                })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBadge;
