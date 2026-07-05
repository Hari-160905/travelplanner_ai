import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar(){
  return (
    <aside className="sidebar">
      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/trips">Trips</NavLink>
        <NavLink to="/expenses">Expenses</NavLink>
        <NavLink to="/ai">AI Assistant</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </nav>
    </aside>
  )
}
