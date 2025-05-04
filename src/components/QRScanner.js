// QRScanner.js
import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        try {
          const parsed = JSON.parse(decodedText);
          onScanSuccess(parsed);
          scanner.clear(); // stop scanning after success
        } catch (err) {
          console.error('Invalid QR code data:', err);
        }
      },
      (errorMessage) => {
        // ignore scan errors silently
      }
    );

    return () => {
      scanner.clear().catch((err) => console.error('Scanner cleanup error', err));
    };
  }, [onScanSuccess]);

  return <div id="qr-reader" style={{ width: '100%' }} />;
};

export default QRScanner;
