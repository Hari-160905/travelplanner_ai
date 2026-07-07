import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiMapPin, FiDollarSign, FiCpu, FiSettings, FiUser } from 'react-icons/fi';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { to: '/trips', label: 'Trips', icon: <FiMapPin /> },
  { to: '/expenses', label: 'Expenses', icon: <FiDollarSign /> },
  { to: '/ai', label: 'AI Assistant', icon: <FiCpu /> },
  { to: '/profile', label: 'Profile', icon: <FiUser /> },
];

export default function Sidebar(){
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Planner</div>
      <nav>
        {links.map((item) => (
          <NavLink key={item.to} to={item.to} className="sidebar-link">
            <span className="sidebar-link__icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <FiSettings />
        <span>Settings</span>
      </div>
    </aside>
  );
}
