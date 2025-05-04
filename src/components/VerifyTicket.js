import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import QRScanner from './QRScanner';

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

            const ipfsURL = tokenURI.startsWith('ipfs://')
              ? `https://gateway.pinata.cloud/ipfs/${tokenURI.split('ipfs://')[1]}`
              : tokenURI;

            const res = await fetch(ipfsURL);
            const metadata = await res.json();

            all.push({
              tokenId: i,
              type: ticketType + 'Ticket',
              eventName: metadata.eventName || 'N/A',
              owner,
            });
          } catch {
            continue; // Skip tokens that throw
          }
        }

        setAllTickets(all);
      } catch (err) {
        console.error('Ticket fetch error:', err);
        toast.error('Failed to load ticket options');
      }
    };

    fetchTickets();
  }, [ticketType, contracts]);

  const handleVerify = async () => {
    if (!tokenId) return;
    setVerifying(true);
    setTicketDetails(null);

    try {
      const contract = contracts[ticketType + 'Ticket'];
      const owner = await contract.ownerOf(tokenId);
      const uri = await contract.tokenURI(tokenId);

      const ipfsURL = uri.startsWith('ipfs://')
        ? `https://gateway.pinata.cloud/ipfs/${uri.split('ipfs://')[1]}`
        : uri;

      const res = await fetch(ipfsURL);
      const metadata = await res.json();

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
      toast.error('Invalid token ID or unable to verify ticket');
    } finally {
      setVerifying(false);
    }
  };

  const handleQRVerify = async (contractAddress, tokenId, expectedOwner) => {
    setVerifying(true);
    setTicketDetails(null);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const matchedType = Object.entries(contracts).find(([key, instance]) => 
        instance.address.toLowerCase() === contractAddress.toLowerCase()
      );
      
      if (!matchedType) {
        toast.error("Unrecognized contract address");
        return;
      }
      
      const [typeKey, contractInstance] = matchedType;
      const abi = contractInstance.interface.fragments;
      const scannedContract = new ethers.Contract(contractAddress, abi, signer);
      const onChainOwner = await scannedContract.ownerOf(tokenId);

      if (expectedOwner && onChainOwner.toLowerCase() !== expectedOwner.toLowerCase()) {
        toast.error("Owner mismatch!");
        return;
      }

      const uri = await scannedContract.tokenURI(tokenId);
      const ipfsURL = uri.startsWith("ipfs://")
        ? `https://gateway.pinata.cloud/ipfs/${uri.split("ipfs://")[1]}`
        : uri;

      const res = await fetch(ipfsURL);
      const metadata = await res.json();

      setTicketDetails({
        owner: onChainOwner,
        eventName: metadata.eventName || "N/A",
        date: metadata.date || "N/A",
      });

      toast.success("QR Verified ✅");
    } catch (err) {
      console.error("QR verification error:", err);
      toast.error("QR verification failed");
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
        isUsed: true
      };

      const response = await fetch('http://localhost:5001/upload-to-pinata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMetadata)
      });

      const { ipfsHash } = await response.json();
      const newURI = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      const tx = await contract.markAsUsed(tokenId, newURI);
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
          <select
            value={tokenId}
            onChange={e => setTokenId(e.target.value)}
            disabled={allTickets.length === 0}
          >
            <option value=''>-- Select --</option>
            {allTickets.map(ticket => (
              <option key={ticket.tokenId} value={ticket.tokenId}>
                {`Event: ${ticket.eventName} | ID: ${ticket.tokenId} | Owner: ${ticket.owner.slice(0, 6)}...${ticket.owner.slice(-4)}`}
              </option>
            ))}
          </select>
        </label>

        <button onClick={handleVerify}>Verify
        </button>

        <div style={{ marginTop: '40px' }}>
          <h3>Or Scan QR Code</h3>
          <QRScanner onScanSuccess={(data) => {
            if (!data.contract || !data.tokenId) {
              toast.error("Invalid QR code format");
              return;
            }
            handleQRVerify(data.contract, data.tokenId, data.owner);
          }} />

        </div>

      </div>

      {ticketDetails && (
        <div style={{ marginTop: '32px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px', background: '#f9f9f9' }}>
          <p><strong>Owner:</strong> {ticketDetails.owner}</p>
          <p><strong>Event:</strong> {ticketDetails.eventName}</p>
          <p><strong>Date:</strong> {ticketDetails.date}</p>
          {ticketType === 'Dynamic' && (
            <>
              <p><strong>Used:</strong> {ticketDetails.isUsed ? '✅ Yes' : '❌ No'}</p>
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