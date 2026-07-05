import React, { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { tripPlanner, packingList, budgetOptimizer, chatAssistant, getAIHistory } from '../services/aiService';
import { useToast } from '../context/ToastContext';

export default function AI(){
  const [tab, setTab] = useState('planner');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ destination:'', budget:'', days:'', interests:'', season:'', currentExpenses:[], question:'' });
  const { showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if(tab==='planner') res = await tripPlanner({ destination: form.destination, budget: form.budget, days: form.days, interests: form.interests });
      if(tab==='packing') res = await packingList({ destination: form.destination, season: form.season });
      if(tab==='budget') res = await budgetOptimizer({ currentExpenses: form.currentExpenses, budget: form.budget });
      if(tab==='chat') res = await chatAssistant({ question: form.question });
      setResponse(res.data.result);
    } catch (err) {
      showError(err?.response?.data?.message || 'AI request failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="card">
      <h2>AI Assistant</h2>
      <div className="hstack" style={{marginBottom:12}}>
        <button className="btn secondary" type="button" onClick={() => setTab('planner')}>Trip Planner</button>
        <button className="btn secondary" type="button" onClick={() => setTab('packing')}>Packing List</button>
        <button className="btn secondary" type="button" onClick={() => setTab('budget')}>Budget Optimizer</button>
        <button className="btn secondary" type="button" onClick={() => setTab('chat')}>Chat</button>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        {tab==='planner' && (
          <>
            <input placeholder="Destination" value={form.destination} onChange={(e)=>setForm({...form,destination:e.target.value})} required />
            <input placeholder="Budget" value={form.budget} onChange={(e)=>setForm({...form,budget:e.target.value})} required />
            <input placeholder="Days" value={form.days} onChange={(e)=>setForm({...form,days:e.target.value})} required />
            <textarea placeholder="Interests" value={form.interests} onChange={(e)=>setForm({...form,interests:e.target.value})} rows="3" required />
          </>
        )}
        {tab==='packing' && (
          <>
            <input placeholder="Destination" value={form.destination} onChange={(e)=>setForm({...form,destination:e.target.value})} required />
            <input placeholder="Season" value={form.season} onChange={(e)=>setForm({...form,season:e.target.value})} required />
          </>
        )}
        {tab==='budget' && (
          <>
            <input placeholder="Budget" value={form.budget} onChange={(e)=>setForm({...form,budget:e.target.value})} required />
            <textarea placeholder="Current expenses JSON" value={JSON.stringify(form.currentExpenses)} onChange={(e)=>setForm({...form,currentExpenses: JSON.parse(e.target.value || '[]')})} rows="4" />
          </>
        )}
        {tab==='chat' && (
          <textarea placeholder="Ask a travel question" value={form.question} onChange={(e)=>setForm({...form,question:e.target.value})} rows="4" required />
        )}
        <button className="btn" type="submit" disabled={loading}>{loading ? <LoadingSpinner /> : 'Send to AI'}</button>
      </form>
      {response && (
        <div className="card">
          <h3>AI Response</h3>
          <pre style={{whiteSpace:'pre-wrap'}}>{response}</pre>
        </div>
      )}
    </div>
  );
}
