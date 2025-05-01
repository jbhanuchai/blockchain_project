import React from "react";
import { Link } from "react-router-dom";

const NavBar = ({ userAddress }) => (
  <nav style={{ padding: "10px", backgroundColor: "#222", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div>
      <Link to="/" style={{ marginRight: 10, color: "white", textDecoration: "none" }}>Home</Link>
      <Link to="/buy-ticket" style={{ marginRight: 10, color: "white", textDecoration: "none" }}>Buy Ticket</Link>
      <Link to="/my-tickets" style={{ marginRight: 10, color: "white", textDecoration: "none" }}>My Tickets</Link>
      <Link to="/resell-ticket" style={{ marginRight: 10, color: "white", textDecoration: "none" }}>Resell</Link>
      <Link to="/event-status" style={{ marginRight: 10, color: "white", textDecoration: "none" }}>Admin</Link>
      <Link to="/verify" style={{ marginRight: 10, color: "white", textDecoration: "none" }}>Verify</Link>
      <Link to="/my-badge" style={{ marginRight: 10, color: "white", textDecoration: "none" }}>My Badge</Link>
    </div>
    <div style={{ color: "white" }}>
      {userAddress ? `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : "Not Connected"}
    </div>
  </nav>
);

export default NavBar;