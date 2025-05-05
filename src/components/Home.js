import React from "react";

// Home component - displays welcome screen and wallet connection UI
const Home = ({ userAddress, connectWallet }) => {
  // Check if the user is connected by verifying if userAddress exists
  const isConnected = !!userAddress;

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>Welcome to the NFT Ticketing System</h1>
      <p style={styles.subtitle}>
        Use the navigation links above to explore or connect your wallet to begin.
      </p>

      {/* Conditional rendering based on wallet connection */}
      {!isConnected ? (
        <button style={styles.button} onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        // If connected, show a truncated wallet address
        <p style={styles.connected}>
          Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
        </p>
      )}
    </div>
  );
};

// Inline styles for layout and elements
const styles = {
  wrapper: {
    paddingTop: "100px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    minHeight: "calc(100vh - 60px)", // ensures content fills viewport
  },
  title: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#111",
  },
  subtitle: {
    fontSize: "1.25rem",
    color: "#555",
    marginBottom: "30px",
    maxWidth: "600px", // limits subtitle width for readability
  },
  button: {
    padding: "12px 28px",
    fontSize: "1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  connected: {
    fontSize: "1rem",
    color: "#28a745", // green for success/connected
    fontWeight: "bold",
  },
};

export default Home;
