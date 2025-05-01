import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import uploadToPinata from '../utils/pinata'; // Changed to default import

const AdminDashboard = ({ contracts, userAddress }) => {
  const [isOwner, setIsOwner] = useState({});
  const [ticketData, setTicketData] = useState({
    type: 'StandardTicket',
    recipient: '',
    eventName: '',
    date: '',
    price: '',
    maxResalePrice: '',
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkOwner = async () => {
      const ownerStatus = {};
      for (const [type, contract] of Object.entries(contracts)) {
        try {
          const owner = await contract.owner();
          ownerStatus[type] = owner.toLowerCase() === userAddress.toLowerCase();
        } catch (err) {
          ownerStatus[type] = false;
        }
      }
      setIsOwner(ownerStatus);
    };
    if (Object.keys(contracts).length && userAddress) checkOwner();
  }, [contracts, userAddress]);

  const mintTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { type, recipient, eventName, date, price, maxResalePrice } = ticketData;

      if (!recipient || !eventName || !date) {
        throw new Error('Recipient, event name, and date are required');
      }
      if ((type === 'StandardTicket' || type === 'RoyaltyTicket') && !price) {
        throw new Error('Price is required for Standard and Royalty tickets');
      }
      if (type === 'RoyaltyTicket' && !maxResalePrice) {
        throw new Error('Max resale price is required for Royalty tickets');
      }

      const uri = await uploadToPinata(eventName, date, price || '0');
      setMessage(`Metadata uploaded to IPFS: ${uri}`);

      const contract = contracts[type];
      let tx;
      if (type === 'StandardTicket') {
        tx = await contract.mintTicket(recipient, uri, ethers.utils.parseEther(price));
      } else if (type === 'SoulboundTicket') {
        tx = await contract.mint(recipient, uri);
      } else if (type === 'RoyaltyTicket') {
        tx = await contract.mintTicket(
          recipient,
          uri,
          ethers.utils.parseEther(price),
          ethers.utils.parseEther(maxResalePrice)
        );
      } else if (type === 'DynamicTicket') {
        tx = await contract.mintTicket(recipient, uri);
      }
      await tx.wait();
      toast.success(`Ticket minted: ${tx.hash}`);
    } catch (err) {
      toast.error('Failed to mint ticket');
      setMessage(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const allTickets = [];
      for (const [type, contract] of Object.entries(contracts)) {
        for (let tokenId = 0; tokenId < 10; tokenId++) {
          try {
            const owner = await contract.ownerOf(tokenId);
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
            const isUsed = type === 'DynamicTicket' ? await contract.isUsed(tokenId) : false;
            allTickets.push({ type, tokenId, owner, metadata, isUsed });
          } catch (err) {
            // Token doesn't exist
          }
        }
      }
      setTickets(allTickets);
    } catch (err) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const updateMetadata = async (type, tokenId, newEventName, newDate) => {
    if (type !== 'DynamicTicket') return;
    try {
      const newURI = await uploadToPinata(newEventName, newDate, '0');
      const tx = await contracts.DynamicTicket.updateMetadata(tokenId, newURI);
      await tx.wait();
      toast.success('Metadata updated');
    } catch (err) {
      toast.error('Failed to update metadata');
      console.error(err);
    }
  };

  return (
    <div className="section">
      <h2>Admin Dashboard</h2>
      {Object.values(isOwner).some((v) => v) ? (
        <>
          <h3>Mint Ticket</h3>
          <form onSubmit={mintTicket}>
            <select
              className="select"
              value={ticketData.type}
              onChange={(e) => setTicketData({ ...ticketData, type: e.target.value })}
            >
              <option value="StandardTicket">Standard</option>
              <option value="SoulboundTicket">Soulbound</option>
              <option value="RoyaltyTicket">Royalty</option>
              <option value="DynamicTicket">Dynamic</option>
            </select>
            <input
              className="input"
              type="text"
              placeholder="Recipient Address"
              value={ticketData.recipient}
              onChange={(e) => setTicketData({ ...ticketData, recipient: e.target.value })}
              disabled={loading}
            />
            <input
              className="input"
              type="text"
              placeholder="Event Name"
              value={ticketData.eventName}
              onChange={(e) => setTicketData({ ...ticketData, eventName: e.target.value })}
              disabled={loading}
            />
            <input
              className="input"
              type="text"
              placeholder="Event Date (YYYY-MM-DD)"
              value={ticketData.date}
              onChange={(e) => setTicketData({ ...ticketData, date: e.target.value })}
              disabled={loading}
            />
            {(ticketData.type === 'StandardTicket' || ticketData.type === 'RoyaltyTicket') && (
              <input
                className="input"
                type="text"
                placeholder="Price (ETH)"
                value={ticketData.price}
                onChange={(e) => setTicketData({ ...ticketData, price: e.target.value })}
                disabled={loading}
              />
            )}
            {ticketData.type === 'RoyaltyTicket' && (
              <input
                className="input"
                type="text"
                placeholder="Max Resale Price (ETH)"
                value={ticketData.maxResalePrice}
                onChange={(e) => setTicketData({ ...ticketData, maxResalePrice: e.target.value })}
                disabled={loading}
              />
            )}
            <button
              type="submit"
              className="button button-secondary"
              disabled={loading}
            >
              {loading ? 'Minting...' : 'Mint Ticket'}
            </button>
          </form>
          {message && <p>{message}</p>}
          <h3>Monitor Tickets</h3>
          <button
            onClick={fetchTickets}
            className="button button-primary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Fetch Tickets'}
          </button>
          <div className="grid">
            {tickets.map((ticket) => (
              <div key={`${ticket.type}-${ticket.tokenId}`} className="card">
                <p><strong>Event:</strong> {ticket.metadata.eventName}</p>
                <p><strong>Type:</strong> {ticket.type}</p>
                <p><strong>Token ID:</strong> {ticket.tokenId}</p>
                <p><strong>Owner:</strong> {ticket.owner}</p>
                {ticket.type === 'DynamicTicket' && (
                  <p><strong>Used:</strong> {ticket.isUsed ? 'Yes' : 'No'}</p>
                )}
                {ticket.type === 'DynamicTicket' && (
                  <button
                    className="button button-primary"
                    onClick={() => updateMetadata(ticket.type, ticket.tokenId, 'Updated Event', '2025-06-01')}
                  >
                    Update Metadata
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>You are not the contract owner.</p>
      )}
    </div>
  );
};

export default AdminDashboard;