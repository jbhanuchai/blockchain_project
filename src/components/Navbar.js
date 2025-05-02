import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <nav style={styles.nav}>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/buy-ticket" style={styles.link}>Buy Ticket</Link>
        <Link to="/my-tickets" style={styles.link}>My Tickets</Link>
        <Link to="/resell-ticket" style={styles.link}>Resell</Link>
        <Link to="/event-status" style={styles.link}>Admin</Link>
        <Link to="/verify" style={styles.link}>Verify</Link>
        <Link to="/my-badge" style={styles.link}>My Badge</Link>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: "#111",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },
  links: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
  },  
  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "1rem",
    fontWeight: "500",
  },
};

export default NavBar;
