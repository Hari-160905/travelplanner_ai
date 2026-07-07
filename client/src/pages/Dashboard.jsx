import React, { useEffect, useMemo, useState } from 'react';
import { FiActivity, FiBriefcase, FiDollarSign, FiMapPin } from 'react-icons/fi';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
import { getTrips } from '../services/tripService';
import { getExpenses, getSummary } from '../services/expenseService';

const categoryColors = {
  Food: '#10b981',
  Transport: '#3b82f6',
  Shopping: '#f59e0b',
  Hotel: '#8b5cf6',
  Others: '#ef4444',
};

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
          getTrips({ limit: 8 }),
          getExpenses({ limit: 8 }),
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

  const chartData = useMemo(() => {
    const categories = ['Food', 'Transport', 'Shopping', 'Hotel', 'Others'];
    const totals = categories.map((name) => {
      const match = summary?.categories?.find((item) => item.category === name);
      return { name, amount: Number(match?.total || 0) };
    });
    const max = Math.max(...totals.map((item) => item.amount), 1);
    return totals.map((item) => ({ ...item, width: (item.amount / max) * 100 }));
  }, [summary]);

  const tripBreakdown = useMemo(() => {
    return stats.trips.map((trip) => {
      const expenseTotal = stats.expenses.filter((expense) => expense.trip_id === trip.id).reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const budget = Number(trip.budget || 0);
      const remaining = budget - expenseTotal;
      const usage = budget > 0 ? (expenseTotal / budget) * 100 : 0;
      return { ...trip, expenseTotal, remaining, usage };
    });
  }, [stats]);

  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Track your travel budget, upcoming plans, and spending insights.</p>
        </div>
      </div>

      {loading ? <LoadingSkeleton count={4} /> : (
        <>
          <div className="stats-grid">
            <StatCard title="Total Trips" value={stats.trips.length} subtitle="Planned journeys" icon={<FiMapPin />} />
            <StatCard title="Total Expenses" value={summary?.total ?? 0} subtitle="Across all trips" icon={<FiDollarSign />} />
            <StatCard title="Remaining Budget" value={Number(summary?.total || 0) > 0 ? 'On track' : 'No data'} subtitle="Budget overview" icon={<FiBriefcase />} />
            <StatCard title="Upcoming Trips" value={stats.trips.filter((trip) => new Date(trip.start_date) >= new Date()).length} subtitle="Next departures" icon={<FiActivity />} />
          </div>

          <div className="card-grid">
            <div className="card chart-card">
              <h3>Expenses by Category</h3>
              <div className="chart-list">
                {chartData.map((item) => (
                  <div key={item.name} className="chart-row">
                    <div className="chart-row__label">{item.name}</div>
                    <div className="chart-row__bar">
                      <div className="chart-row__fill" style={{ width: `${item.width}%`, background: categoryColors[item.name] || '#94a3b8' }} />
                    </div>
                    <div className="chart-row__value">{item.amount}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card chart-card">
              <h3>Monthly Expenses</h3>
              <div className="chart-list">
                {(summary?.monthly || []).slice().reverse().map((item) => (
                  <div className="chart-row" key={item.month}>
                    <div className="chart-row__label">{item.month}</div>
                    <div className="chart-row__bar">
                      <div className="chart-row__fill" style={{ width: `${Math.min(100, (Number(item.total) / 20000) * 100)}%`, background: '#6366f1' }} />
                    </div>
                    <div className="chart-row__value">{item.total}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Budget vs Expenses</h3>
            <div className="chart-list">
              {stats.trips.slice(0, 5).map((trip) => {
                const expenseTotal = Number(stats.expenses.filter((expense) => expense.trip_id === trip.id).reduce((sum, item) => sum + Number(item.amount || 0), 0));
                const budget = Number(trip.budget || 0);
                return (
                  <div className="chart-row" key={trip.id}>
                    <div className="chart-row__label">{trip.destination}</div>
                    <div className="chart-row__bar">
                      <div className="chart-row__fill" style={{ width: `${budget > 0 ? Math.min(100, (expenseTotal / budget) * 100) : 0}%`, background: expenseTotal > budget ? '#ef4444' : '#10b981' }} />
                    </div>
                    <div className="chart-row__value">{expenseTotal}/{budget}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3>Expenses by Trip</h3>
            <div className="trip-breakdown-grid">
              {tripBreakdown.map((trip) => (
                <div key={trip.id} className="trip-card">
                  <div className="trip-card__header">
                    <div>
                      <h4>{trip.destination}</h4>
                      <p>{trip.title}</p>
                    </div>
                    <span className={`pill ${trip.usage > 90 ? 'danger' : trip.usage > 60 ? 'warning' : 'success'}`}>{trip.usage > 90 ? 'Critical' : trip.usage > 60 ? 'Watch' : 'Healthy'}</span>
                  </div>
                  <div className="trip-card__meta">
                    <div><strong>Budget</strong><span>{trip.budget}</span></div>
                    <div><strong>Expenses</strong><span>{trip.expenseTotal}</span></div>
                    <div><strong>Remaining</strong><span>{trip.remaining}</span></div>
                  </div>
                  <ProgressBar value={trip.usage} label="Budget used" />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>Existing Summary</h3>
            <p>Total spent: {summary?.total ?? 0}</p>
            <p>Categories: {summary?.categories?.length ?? 0}</p>
          </div>
        </>
      )}
    </div>
  );
}
