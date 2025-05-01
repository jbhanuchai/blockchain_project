import React, { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { QRCodeCanvas } from 'qrcode.react'; // Updated import

const VerifyTicket = ({ contracts }) => {
  const [tokenId, setTokenId] = useState('');
  const [signature, setSignature] = useState('');
  const [contractType, setContractType] = useState('StandardTicket');
  const [verificationResult, setVerificationResult] = useState(null);
  const [qrTokenId, setQrTokenId] = useState('');

  const generateQR = async (tokenId) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const message = `Verify ticket ${tokenId}`;
      const signature = await signer.signMessage(message);
      return JSON.stringify({ tokenId, signature, contractType });
    } catch (err) {
      toast.error('Failed to generate QR code');
      return '';
    }
  };

  const verifyTicket = async () => {
    try {
      const contract = contracts[contractType];
      const signerAddress = ethers.utils.verifyMessage(`Verify ticket ${tokenId}`, signature);
      const owner = await contract.ownerOf(tokenId);
      const isValid = signerAddress.toLowerCase() === owner.toLowerCase();
      const isUsed = contractType === 'DynamicTicket' ? await contract.isUsed(tokenId) : false;
      setVerificationResult({ isValid, isUsed });
      toast.success('Verification complete');
    } catch (err) {
      toast.error('Verification failed');
      setVerificationResult(null);
    }
  };

  return (
    <div className="section">
      <h2>Verify Ticket</h2>
      <select
        className="select"
        value={contractType}
        onChange={(e) => setContractType(e.target.value)}
      >
        <option value="StandardTicket">Standard</option>
        <option value="SoulboundTicket">Soulbound</option>
        <option value="RoyaltyTicket">Royalty</option>
        <option value="DynamicTicket">Dynamic</option>
      </select>
      <input
        className="input"
        type="text"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />
      <input
        className="input"
        type="text"
        placeholder="Signature"
        value={signature}
        onChange={(e) => setSignature(e.target.value)}
      />
      <button
        className="button button-secondary"
        onClick={verifyTicket}
      >
        Verify
      </button>
      {verificationResult && (
        <p>
          <strong>Valid:</strong> {verificationResult.isValid ? 'Yes' : 'No'}
          {contractType === 'DynamicTicket' && (
            <>, <strong>Used:</strong> {verificationResult.isUsed ? 'Yes' : 'No'}</>
          )}
        </p>
      )}
      <h3>Generate QR Code</h3>
      <input
        className="input"
        type="text"
        placeholder="Token ID for QR"
        value={qrTokenId}
        onChange={(e) => setQrTokenId(e.target.value)}
      />
      {qrTokenId && <QRCodeCanvas value={generateQR(qrTokenId)} />}
    </div>
  );
};

export default VerifyTicket;