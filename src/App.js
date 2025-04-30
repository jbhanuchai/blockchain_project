import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import BuyTicket from "./pages/BuyTicket";
import MyTickets from "./pages/MyTickets";
import ResellTicket from "./pages/ResellTicket";
import Admin from "./pages/Admin";
import MyBadge from "./pages/MyBadge";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buy-ticket" element={<BuyTicket />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/resell-ticket" element={<ResellTicket />} />
        <Route path="/event-status" element={<Admin />} />
        <Route path="/my-badge" element={<MyBadge />} />
      </Routes>
    </Router>
  );
};

export default App;
