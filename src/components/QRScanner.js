// QRScanner.js
import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

// This component sets up a QR code scanner using the html5-qrcode library
// It calls the onScanSuccess callback with parsed QR data when a valid QR is scanned
const QRScanner = ({ onScanSuccess }) => {
  useEffect(() => {
    // Initialize the QR scanner in the div with id 'qr-reader'
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: 250 }, // fps = frames per second, qrbox = size of scanning area
      false                    // disable verbose logs
    );

    // Start the scanner with success and error handlers
    scanner.render(
      (decodedText) => {
        try {
          // Parse the decoded text as JSON and pass it to the success handler
          const parsed = JSON.parse(decodedText);
          onScanSuccess(parsed);

          // Stop scanning after a successful read
          scanner.clear();
        } catch (err) {
          // Log any error that occurs while parsing QR code content
          console.error('Invalid QR code data:', err);
        }
      },
      (errorMessage) => {
        // Silently ignore scan errors
      }
    );

    // Cleanup: Stop the scanner when the component is unmounted
    return () => {
      scanner.clear().catch((err) => console.error('Scanner cleanup error', err));
    };
  }, [onScanSuccess]);

  // The div where the QR scanner will render
  return <div id="qr-reader" style={{ width: '100%' }} />;
};

export default QRScanner;
