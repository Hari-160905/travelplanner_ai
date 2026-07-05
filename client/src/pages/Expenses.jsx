import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getExpenses, createExpense, updateExpense, deleteExpense, getSummary, getBudgetRemaining } from '../services/expenseService';
import { getTrips } from '../services/tripService';
import { useToast } from '../context/ToastContext';

const initial = { tripId:'', category:'', amount:'', currency:'USD', description:'', spentAt:'' };

export default function Expenses(){
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState(null);
  const [editId, setEditId] = useState(null);
  const { showError, showSuccess } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [expenseRes, tripRes, summaryRes] = await Promise.all([
        getExpenses({ limit: 20 }),
        getTrips({ limit: 50 }),
        getSummary(),
      ]);
      setExpenses(expenseRes.data.expenses);
      setTrips(tripRes.data.trips);
      setSummary(summaryRes.data);
    } catch (err) {
      showError('Unable to load expenses');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if(editId){
        await updateExpense(editId, form);
        showSuccess('Expense updated');
      } else {
        await createExpense(form);
        showSuccess('Expense added');
      }
      setForm(initial);
      setEditId(null);
      await loadData();
    } catch (err) {
      showError(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const startEdit = (item)=>{
    setEditId(item.id);
    setForm({ tripId: item.trip_id || '', category: item.category, amount: item.amount, currency: item.currency, description: item.description || '', spentAt: item.spent_at.slice(0,10) });
  };

  const handleDelete = async (id)=>{
    if(!window.confirm('Delete this expense?')) return;
    try { await deleteExpense(id); showSuccess('Removed'); loadData(); } catch { showError('Delete failed'); }
  };

  const handleBudgetCheck = async () => {
    if(!form.tripId) return;
    try {
      const res = await getBudgetRemaining(form.tripId);
      showSuccess(`Budget remaining: $${res.data.remaining}`);
    } catch { showError('Could not calculate budget'); }
  };

  return (
    <div className="card">
      <h2>Expenses</h2>
      <div className="card form">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <select value={form.tripId} onChange={(e)=>setForm({...form,tripId:e.target.value})}>
              <option value="">Select Trip (optional)</option>
              {trips.map((trip)=><option key={trip.id} value={trip.id}>{trip.title}</option>)}
            </select>
            <input placeholder="Category" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} required />
          </div>
          <div className="row">
            <input type="number" placeholder="Amount" value={form.amount} onChange={(e)=>setForm({...form,amount:e.target.value})} required />
            <input placeholder="Currency" value={form.currency} onChange={(e)=>setForm({...form,currency:e.target.value})} required />
          </div>
          <div className="row">
            <input type="date" value={form.spentAt} onChange={(e)=>setForm({...form,spentAt:e.target.value})} required />
            <button type="button" className="btn secondary" onClick={handleBudgetCheck}>Check Budget</button>
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} rows="3" />
          <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add Expense'}</button>
        </form>
      </div>
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="card">
            <h3>Summary</h3>
            <p>Total spent: ${summary?.total ?? 0}</p>
            <p>Categories: {summary?.categories?.length ?? 0}</p>
          </div>
          <table className="table">
            <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Trip</th><th>Actions</th></tr></thead>
            <tbody>
              {expenses.map(item=><tr key={item.id}><td>{item.spent_at.slice(0,10)}</td><td>{item.category}</td><td>${item.amount}</td><td>{item.trip_id || '-'}</td><td><button className="btn secondary" onClick={()=>startEdit(item)}>Edit</button><button className="btn secondary" onClick={()=>handleDelete(item.id)}>Delete</button></td></tr>)}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
