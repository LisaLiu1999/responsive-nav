import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <Link to="/" className="logo" onClick={() => setIsOpen(false)}>
      <img src= "./petpallogo.svg" alt="Petpal Logo" className="logo-img"/>
      </Link>

      <div className="hamburger" onClick={toggleMenu}>☰</div>

      <ul className={isOpen ? "nav-links open" : "nav-links"}>
        <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
        <li><Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link></li>
        <li><Link to="/services" onClick={() => setIsOpen(false)}>Services</Link></li>
        <li><Link to="/login" onClick={() => setIsOpen(false)}><div className="login-btn">Log In</div></Link></li>
        {/* <p>Log Out</p> */}
      </ul>
    </nav>
  );
}

export default Navbar;