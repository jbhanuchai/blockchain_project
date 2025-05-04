import React, { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { getMetadata } from '../utils/getMetadata';

const AdminDashboard = ({ contracts, userAddress }) => {
  const [ticketType, setTicketType] = useState('Standard');
  const [recipient, setRecipient] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [price, setPrice] = useState('');
  const [maxResale, setMaxResale] = useState('');
  const [minting, setMinting] = useState(false);
  const [lastMinted, setLastMinted] = useState(null);
  const [allTickets, setAllTickets] = useState([]);
  const [fetching, setFetching] = useState(false);

  const requiresPrice = () => ticketType === 'Standard' || ticketType === 'Royalty';

  const resetForm = () => {
    setRecipient('');
    setEventName('');
    setEventDate('');
    setPrice('');
    setMaxResale('');
  };

  const handleMint = async () => {
    if (
      !recipient || !eventName || !eventDate ||
      (requiresPrice() && !price) ||
      (ticketType === 'Royalty' && !maxResale)
    ) {
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
        const maxResalePrice = ethers.utils.parseEther(maxResale);
        tx = await contracts.RoyaltyTicket.mintTicket(recipient, tokenURI, originalPrice, maxResalePrice);
        await tx.wait();
        tokenId = await contracts.RoyaltyTicket.totalSupply().then(n => n - 1);
      } else if (ticketType === 'Soulbound') {
        tx = await contracts.SoulboundTicket.mint(recipient, tokenURI);
        await tx.wait();
        tokenId = await contracts.SoulboundTicket.totalSupply().then(n => n - 1);
      }

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

  const fetchAllTickets = async () => {
    setFetching(true);
    const tickets = [];

    for (const [type, contract] of Object.entries(contracts)) {
      try {
        const total = await contract.totalSupply();
        for (let i = 0; i < total; i++) {
          try {
            const owner = await contract.ownerOf(i);
            const tokenURI = await contract.tokenURI(i);
            if (!tokenURI || tokenURI.includes("undefined")) continue;

            const metadata = await getMetadata(tokenURI, `${type}-${i}`);
            let price = '0';
            if (type === 'StandardTicket' || type === 'RoyaltyTicket') {
              try {
                const rawPrice = await contract.originalPrices(i);
                price = ethers.utils.formatEther(rawPrice);
              } catch (err) {
                console.warn(`Failed to fetch price for ${type} token ${i}`);
              }
            }

            tickets.push({
              type,
              tokenId: i,
              owner,
              metadata,
              price,
            });
          } catch (err) {
            console.warn(`Skipping token ${i} from ${type}`, err.message);
          }
        }
      } catch (err) {
        console.error(`Failed to fetch from ${type}`, err);
      }
    }

    setAllTickets(tickets);
    setFetching(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Admin Dashboard</h2>

      {/* Mint Form */}
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

        {ticketType === 'Royalty' && (
          <label>
            Max Resale Price (ETH):
            <input type="number" value={maxResale} onChange={e => setMaxResale(e.target.value)} />
          </label>
        )}

        <button onClick={handleMint} disabled={minting}>
          {minting ? 'Minting...' : 'Mint Ticket'}
        </button>
      </div>

      {/* Minted Preview */}
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

      {/* Monitor Section */}
      <div style={{ marginTop: '40px' }}>
        <h3>All Minted Tickets</h3>
        <button onClick={fetchAllTickets} disabled={fetching}>
          {fetching ? 'Fetching...' : 'Fetch Tickets'}
        </button>

        {allTickets.length > 0 && (
          <div style={{ marginTop: '20px', display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {allTickets.map((t, idx) => (
              <div key={idx} style={styles.card}>
                <p><strong>Event:</strong> {t.metadata?.eventName || 'Unknown'}</p>
                <p><strong>Date:</strong> {t.metadata?.date || 'Unknown'}</p>
                <p><strong>Type:</strong> {t.type}</p>
                <p><strong>Token ID:</strong> {t.tokenId}</p>
                <p><strong>Owner:</strong> {t.owner.slice(0, 6)}...{t.owner.slice(-4)}</p>
                {(t.type === 'StandardTicket' || t.type === 'RoyaltyTicket') && (
                  <p><strong>Price:</strong> {t.price} ETH</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px',
    maxWidth: '1000px',
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
  },
};

export default AdminDashboard;