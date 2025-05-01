import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const MyBadge = ({ contracts, userAddress }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBadges = async () => {
      setLoading(true);
      try {
        const badgeList = [];
        const contract = contracts.SoulboundTicket;
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
            metadata = { eventName: 'Unknown', date: 'N/A' };
          }
          badgeList.push({ tokenId: tokenId.toString(), metadata });
        }
        setBadges(badgeList);
      } catch (err) {
        toast.error('Failed to fetch badges');
        console.error(err);
      }
      setLoading(false);
    };
    if (contracts.SoulboundTicket && userAddress) fetchBadges();
  }, [contracts, userAddress]);

  return (
    <div className="section">
      <h2>My Badges</h2>
      {loading && <p className="loading">Loading badges...</p>}
      {badges.length === 0 && !loading && <p>No badges found.</p>}
      <div className="grid">
        {badges.map((badge) => (
          <div key={badge.tokenId} className="card">
            <p><strong>Event:</strong> {badge.metadata.eventName}</p>
            <p><strong>Date:</strong> {badge.metadata.date}</p>
            <p><strong>Token ID:</strong> {badge.tokenId}</p>
            <p><strong>Type:</strong> Soulbound</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBadge;