import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getTrips, createTrip, updateTrip, deleteTrip } from '../services/tripService';
import { useToast } from '../context/ToastContext';

const initialForm = { title:'', destination:'', startDate:'', endDate:'', budget:'', notes:'' };

export default function Trips(){
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const { showError, showSuccess } = useToast();

  const loadTrips = async () => {
    setLoading(true);
    try {
      const res = await getTrips({ limit: 50 });
      setTrips(res.data.trips);
    } catch (err) {
      showError(err?.response?.data?.message || 'Could not load trips');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ loadTrips(); }, []);

  const handleSubmit = async (e)=>{
    e.preventDefault();
    setSaving(true);
    try {
      if(editId){
        await updateTrip(editId, form);
        showSuccess('Trip updated');
      } else {
        await createTrip(form);
        showSuccess('Trip created');
      }
      setForm(initialForm);
      setEditId(null);
      await loadTrips();
    } catch (err) {
      showError(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const startEdit = (trip)=>{
    setEditId(trip.id);
    setForm({ title:trip.title,destination:trip.destination,startDate:trip.start_date,endDate:trip.end_date,budget:trip.budget,notes:trip.notes||'' });
  };

  const handleDelete = async (id)=>{
    if(!window.confirm('Delete this trip?')) return;
    try { await deleteTrip(id); showSuccess('Trip removed'); loadTrips(); } catch (err){ showError('Delete failed'); }
  };

  return (
    <div className="card">
      <h2>Trips</h2>
      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="row">
            <input placeholder="Title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required />
            <input placeholder="Destination" value={form.destination} onChange={(e)=>setForm({...form,destination:e.target.value})} required />
          </div>
          <div className="row">
            <input type="date" value={form.startDate} onChange={(e)=>setForm({...form,startDate:e.target.value})} required />
            <input type="date" value={form.endDate} onChange={(e)=>setForm({...form,endDate:e.target.value})} required />
          </div>
          <div className="row">
            <input type="number" placeholder="Budget" value={form.budget} onChange={(e)=>setForm({...form,budget:e.target.value})} required />
          </div>
          <textarea placeholder="Notes" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} rows="3" />
          <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update Trip' : 'Create Trip'}</button>
        </form>
      </div>
      {loading ? <LoadingSpinner /> : (
        <table className="table">
          <thead><tr><th>Title</th><th>Destination</th><th>Dates</th><th>Budget</th><th>Actions</th></tr></thead>
          <tbody>
            {trips.map(trip=>(
              <tr key={trip.id}>
                <td>{trip.title}</td>
                <td>{trip.destination}</td>
                <td>{trip.start_date} → {trip.end_date}</td>
                <td>{trip.budget}</td>
                <td><button className="btn secondary" type="button" onClick={()=>startEdit(trip)}>Edit</button><button className="btn secondary" type="button" onClick={()=>handleDelete(trip.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
