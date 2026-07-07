import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiMoon, FiSearch, FiSun } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSearch } from '../context/SearchContext';
import { getTrips } from '../services/tripService';

export default function Navbar(){
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { query, setQuery } = useSearch();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const response = await getTrips({ limit: 10 });
        const items = (response.data.trips || []).map((trip) => {
          const start = new Date(trip.start_date);
          const diff = Math.round((start - new Date()) / (1000 * 60 * 60 * 24));
          if (diff >= 0 && diff <= 2) {
            return `Trip to ${trip.destination} starts ${diff === 0 ? 'today' : 'soon'}`;
          }
          return null;
        }).filter(Boolean);
        setNotifications(items.length ? items : ['Budget reminder: review your upcoming travel spend']);
      } catch {
        setNotifications(['Budget reminder: review your upcoming travel spend']);
      }
    };
    load();
  }, [user]);

  const unread = useMemo(() => notifications.length, [notifications]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="brand">
        <Link to={user ? '/dashboard' : '/'}>AI Travel Planner</Link>
      </div>

      <div className="navbar-search">
        <FiSearch />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search trips, expenses, AI"
          aria-label="Global search"
        />
      </div>

      <div className="nav-actions">
        <button className="icon-btn" type="button" aria-label="Notifications">
          <FiBell />
          {unread > 0 ? <span className="badge">{unread}</span> : null}
        </button>
        <button className="icon-btn" type="button" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </button>
        {user ? (
          <>
            <Link to="/profile" className="nav-link">Profile</Link>
            <button className="btn secondary" type="button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}
