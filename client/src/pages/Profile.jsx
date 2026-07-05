import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Profile(){
  const { user, logout } = useAuth();
  const { showSuccess } = useToast();

  if(!user){
    return <div className="card"><h2>Profile</h2><p>Please login to see your profile.</p></div>;
  }

  return (
    <div className="card">
      <h2>Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role || 'user'}</p>
      <button className="btn" onClick={async ()=>{ await logout(); showSuccess('Logged out'); }}>Logout</button>
    </div>
  );
}
