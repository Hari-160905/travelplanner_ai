import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound(){
  return (
    <div className="card">
      <h2>Page Not Found</h2>
      <p>The page you're looking for does not exist.</p>
      <Link to="/">Return home</Link>
    </div>
  );
}
