import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav style={{ padding: "10px", backgroundColor: "#222", color: "#fff" }}>
    <Link to="/" style={{ marginRight: 10, color: "white" }}>Home</Link>
    <Link to="/buy-ticket" style={{ marginRight: 10, color: "white" }}>Buy Ticket</Link>
    <Link to="/my-tickets" style={{ marginRight: 10, color: "white" }}>My Tickets</Link>
    <Link to="/resell-ticket" style={{ marginRight: 10, color: "white" }}>Resell</Link>
    <Link to="/event-status" style={{ marginRight: 10, color: "white" }}>Admin</Link>
    <Link to="/my-badge" style={{ marginRight: 10, color: "white" }}>My Badge</Link>
  </nav>
);

export default Navbar;
