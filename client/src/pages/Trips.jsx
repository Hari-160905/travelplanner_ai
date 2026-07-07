import React, { useEffect, useMemo, useState } from 'react';
import { FiCloud, FiEye } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import { getTrips, createTrip, updateTrip, deleteTrip } from '../services/tripService';
import { useToast } from '../context/ToastContext';
import { useSearch } from '../context/SearchContext';

const initialForm = { title:'', destination:'', startDate:'', endDate:'', budget:'', notes:'' };

export default function Trips(){
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const { showError, showSuccess } = useToast();
  const { query } = useSearch();

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

  const filteredTrips = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return trips;
    return trips.filter((trip) => `${trip.title} ${trip.destination} ${trip.notes}`.toLowerCase().includes(value));
  }, [trips, query]);

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
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <h2>Trips</h2>
          <p>Plan every journey with a modern itinerary overview.</p>
        </div>
      </div>
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
        <div className="trip-grid">
          {filteredTrips.map((trip) => {
            const usage = Number(trip.budget || 0) > 0 ? 50 : 0;
            return (
              <div className="trip-card" key={trip.id}>
                <div className="trip-card__header">
                  <div>
                    <h4>{trip.destination}</h4>
                    <p>{trip.title}</p>
                  </div>
                  <div className="weather-preview">
                    <FiCloud />
                    <span>Sunny</span>
                  </div>
                </div>
                <div className="trip-card__meta">
                  <div><strong>Dates</strong><span>{trip.start_date} → {trip.end_date}</span></div>
                  <div><strong>Budget</strong><span>{trip.budget}</span></div>
                  <div><strong>Expenses</strong><span>{trip.budget ? Math.round(Number(trip.budget) * 0.4) : 0}</span></div>
                </div>
                <ProgressBar value={usage} label="Budget progress" />
                <div className="trip-card__actions">
                  <button className="btn secondary" type="button" onClick={()=>startEdit(trip)}>Edit</button>
                  <button className="btn secondary" type="button" onClick={()=>handleDelete(trip.id)}>Delete</button>
                  <a className="btn" href={`/trips/${trip.id}`}><FiEye /> View Details</a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
