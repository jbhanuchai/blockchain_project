import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const VerifyTicket = ({ contracts }) => {
  const [ticketType, setTicketType] = useState('Standard');
  const [tokenId, setTokenId] = useState('');
  const [ticketDetails, setTicketDetails] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [marking, setMarking] = useState(false);
  const [allTickets, setAllTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const all = [];
        const contract = contracts[ticketType + 'Ticket'];
        const total = await contract.totalSupply();

        for (let i = 0; i < total; i++) {
          try {
            const owner = await contract.ownerOf(i);
            const tokenURI = await contract.tokenURI(i);
            if (!tokenURI || tokenURI.includes("undefined")) continue;

            let ipfsURL = tokenURI.startsWith('ipfs://')
              ? tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
              : tokenURI;

            const metadataRes = await fetch(ipfsURL);
            const metadata = await metadataRes.json();

            all.push({
              tokenId: i,
              type: ticketType + 'Ticket',
              eventName: metadata.eventName,
              owner,
            });
          } catch (err) {
            console.warn(`Skipping token ${i} of ${ticketType}`, err.message);
          }
        }

        setAllTickets(all);
      } catch (err) {
        console.error('Ticket fetch error:', err);
      }
    };

    fetchTickets();
  }, [ticketType]);

  const handleVerify = async () => {
    setVerifying(true);
    setTicketDetails(null);
    try {
      const contract = contracts[ticketType + 'Ticket'];
      const owner = await contract.ownerOf(tokenId);
      const tokenURI = await contract.tokenURI(tokenId);

      let ipfsURL = tokenURI.startsWith('ipfs://')
        ? tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
        : tokenURI;

      const metadataRes = await fetch(ipfsURL);
      const metadata = await metadataRes.json();

      let isUsed = false;
      if (ticketType === 'Dynamic') {
        isUsed = await contract.isUsed(tokenId);
      }

      setTicketDetails({
        owner,
        eventName: metadata.eventName || 'N/A',
        date: metadata.date || 'N/A',
        isUsed
      });
    } catch (err) {
      console.error('Verify error:', err);
      toast.error('Invalid token ID or failed to verify ticket');
    } finally {
      setVerifying(false);
    }
  };

  const handleMarkAsUsed = async () => {
    setMarking(true);
    try {
      const contract = contracts['DynamicTicket'];
      const newMetadata = {
        ...ticketDetails,
        used: true
      };
      const response = await fetch('http://localhost:5001/upload-to-pinata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMetadata),
      });

      const { ipfsHash } = await response.json();
      const newTokenURI = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      const tx = await contract.markAsUsed(tokenId, newTokenURI);
      await tx.wait();
      toast.success('Ticket marked as used');
      setTicketDetails(prev => ({ ...prev, isUsed: true }));
    } catch (err) {
      console.error('Mark as used error:', err);
      toast.error('Failed to mark ticket as used');
    } finally {
      setMarking(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '700px', margin: 'auto' }}>
      <h2>Verify Ticket</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <label>
          Ticket Type:
          <select value={ticketType} onChange={e => setTicketType(e.target.value)}>
            <option value="Standard">Standard</option>
            <option value="Dynamic">Dynamic</option>
            <option value="Royalty">Royalty</option>
            <option value="Soulbound">Soulbound</option>
          </select>
        </label>

        <label>
          Select Ticket:
          <select onChange={(e) => setTokenId(e.target.value)}>
            <option value=''>-- Select --</option>
            {allTickets.map(ticket => (
              <option key={ticket.tokenId} value={ticket.tokenId}>
                {`Event: ${ticket.eventName} | ID: ${ticket.tokenId} | Owner: ${ticket.owner.slice(0,6)}...${ticket.owner.slice(-4)}`}
              </option>
            ))}
          </select>
        </label>

        <button onClick={handleVerify} disabled={verifying || !tokenId}>
          {verifying ? 'Verifying...' : 'Verify'}
        </button>
      </div>

      {ticketDetails && (
        <div style={{ marginTop: '32px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px', background: '#f9f9f9' }}>
          <p><strong>Owner:</strong> {ticketDetails.owner}</p>
          <p><strong>Event:</strong> {ticketDetails.eventName}</p>
          <p><strong>Date:</strong> {ticketDetails.date}</p>
          {ticketType === 'Dynamic' && (
            <>
              <p><strong>Used:</strong> {ticketDetails.isUsed ? 'Yes' : 'No'}</p>
              {!ticketDetails.isUsed && (
                <button onClick={handleMarkAsUsed} disabled={marking}>
                  {marking ? 'Marking...' : 'Mark as Used'}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyTicket;