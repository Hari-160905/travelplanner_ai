import React from 'react';
export default function Home(){
  return (
    <div className="card">
      <h1>Welcome to AI Travel Planner</h1>
      <p>Plan trips, track expenses, and get AI-powered recommendations.</p>
      <div style={{display:'flex',gap:12,marginTop:12}}>
        <a className="btn" href="/register">Get Started</a>
        <a className="btn secondary" href="/ai">Try AI Assistant</a>
      </div>
    </div>
  )
}
