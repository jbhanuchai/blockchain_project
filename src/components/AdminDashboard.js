import React, { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const AdminDashboard = ({ contracts, userAddress }) => {
  const [ticketType, setTicketType] = useState('Standard');
  const [recipient, setRecipient] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [price, setPrice] = useState('');
  const [minting, setMinting] = useState(false);
  const [lastMinted, setLastMinted] = useState(null);

  const handleMint = async () => {
    if (!recipient || !eventName || !eventDate || (requiresPrice() && !price)) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setMinting(true);

      const response = await fetch('http://localhost:5001/upload-to-pinata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, date: eventDate, price }),
      });

      const { ipfsHash } = await response.json();
      const tokenURI = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      let tx, tokenId;
      if (ticketType === 'Standard') {
        tx = await contracts.StandardTicket.mintTicket(recipient, tokenURI, ethers.utils.parseEther(price));
        await tx.wait();
        tokenId = await contracts.StandardTicket.totalSupply().then(n => n - 1);
      } else if (ticketType === 'Dynamic') {
        tx = await contracts.DynamicTicket.mintTicket(recipient, tokenURI);
        await tx.wait();
        tokenId = await contracts.DynamicTicket.totalSupply().then(n => n - 1);
      } else if (ticketType === 'Royalty') {
        const originalPrice = ethers.utils.parseEther(price);
        const maxResalePrice = originalPrice.mul(2);
        tx = await contracts.RoyaltyTicket.mintTicket(recipient, tokenURI, originalPrice, maxResalePrice);
        await tx.wait();
        tokenId = await contracts.RoyaltyTicket.totalSupply().then(n => n - 1);
      } else if (ticketType === 'Soulbound') {
        tx = await contracts.SoulboundTicket.mint(recipient, tokenURI);
        await tx.wait();
        tokenId = await contracts.SoulboundTicket.totalSupply().then(n => n - 1);
      }

      // Update UI with minted ticket
      setLastMinted({
        type: ticketType + 'Ticket',
        tokenId,
        owner: recipient,
        metadata: { eventName, date: eventDate },
        price: requiresPrice() ? price : null,
      });

      toast.success('Ticket minted!');
      resetForm();
    } catch (err) {
      console.error('Minting error:', err);
      toast.error('Failed to mint ticket');
    } finally {
      setMinting(false);
    }
  };

  const requiresPrice = () => ticketType === 'Standard' || ticketType === 'Royalty';

  const resetForm = () => {
    setRecipient('');
    setEventName('');
    setEventDate('');
    setPrice('');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Admin Dashboard</h2>

      <div style={styles.form}>
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
          Recipient Address:
          <input value={recipient} onChange={e => setRecipient(e.target.value)} />
        </label>

        <label>
          Event Name:
          <input value={eventName} onChange={e => setEventName(e.target.value)} />
        </label>

        <label>
          Event Date:
          <input
            type="date"
            value={eventDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setEventDate(e.target.value)}
          />

        </label>

        {requiresPrice() && (
          <label>
            Price (ETH):
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} />
          </label>
        )}

        <button onClick={handleMint} disabled={minting}>
          {minting ? 'Minting...' : 'Mint Ticket'}
        </button>
      </div>

      {lastMinted && (
        <div style={{ marginTop: '32px' }}>
          <h3>Recently Minted Ticket</h3>
          <div style={styles.card}>
            <p><strong>Event:</strong> {lastMinted.metadata.eventName}</p>
            <p><strong>Date:</strong> {lastMinted.metadata.date}</p>
            <p><strong>Type:</strong> {lastMinted.type}</p>
            <p><strong>Token ID:</strong> {lastMinted.tokenId}</p>
            <p><strong>Owner:</strong> {lastMinted.owner.slice(0, 6)}...{lastMinted.owner.slice(-4)}</p>
            {lastMinted.price && <p><strong>Price:</strong> {lastMinted.price} ETH</p>}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '40px',
    maxWidth: '900px',
    margin: 'auto',
  },
  header: {
    fontSize: '2rem',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    padding: '16px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    backgroundColor: '#f7f7f7',
  }
};

export default AdminDashboard;