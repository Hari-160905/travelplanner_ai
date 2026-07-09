import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Settings(){

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="card">
      <h2>Settings</h2>

      <div className="card">
        <h3>Appearance</h3>

        <p>
          Current Theme: {theme}
        </p>

        <button 
          className="btn"
          onClick={toggleTheme}
        >
          Change Theme
        </button>

      </div>


      <div className="card">
        <h3>Application Preferences</h3>

        <p>
          Currency: INR
        </p>

        <p>
          Notifications: Enabled
        </p>

      </div>

    </div>
  );
}