import React, { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { getTrips } from '../services/tripService';
import { getExpenses, getSummary } from '../services/expenseService';

export default function Dashboard(){
  const [stats, setStats] = useState({ trips: [], expenses: [] });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tripsRes, expensesRes, summaryRes] = await Promise.all([
          getTrips({ limit: 5 }),
          getExpenses({ limit: 5 }),
          getSummary(),
        ]);
        setStats({ trips: tripsRes.data.trips, expenses: expensesRes.data.expenses });
        setSummary(summaryRes.data);
      } catch (err) {
        showError(err?.response?.data?.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showError]);

  return (
    <div className="card">
      <h2>Dashboard</h2>
      {loading ? <div className="spinner" /> : (
        <>
          <div className="kv">
            <div><strong>Total Trips</strong><div>{stats.trips.length}</div></div>
            <div><strong>Total Expenses</strong><div>{summary?.total ?? 0}</div></div>
            <div><strong>Categories</strong><div>{summary?.categories?.length ?? 0}</div></div>
          </div>
          <div className="card">
            <h3>Recent Trips</h3>
            <ul>{stats.trips.map((trip)=> <li key={trip.id}>{trip.title} - {trip.destination}</li>)}</ul>
          </div>
          <div className="card">
            <h3>Recent Expenses</h3>
            <ul>{stats.expenses.map((expense)=> <li key={expense.id}>{expense.category}: {expense.amount}</li>)}</ul>
          </div>
        </>
      )}
    </div>
  );
}
