import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar(){
  return (
    <header className="navbar">
      <div className="brand"><Link to="/" style={{color:'white',textDecoration:'none'}}>AI Travel Planner</Link></div>
      <div className="nav-actions">
        <Link to="/login" style={{color:'white',textDecoration:'none'}}>Login</Link>
        <Link to="/register" style={{color:'white',textDecoration:'none'}}>Register</Link>
      </div>
    </header>
  )
}
