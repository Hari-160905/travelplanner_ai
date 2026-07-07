import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiCloud, FiMapPin } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import { getTrip } from '../services/tripService';
import { getExpenses } from '../services/expenseService';
import { getWeatherForCity } from '../services/weatherService';
import { useToast } from '../context/ToastContext';

export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tripRes, expenseRes] = await Promise.all([getTrip(id), getExpenses({ tripId: id, limit: 20 })]);
        setTrip(tripRes.data);
        setExpenses(expenseRes.data.expenses || []);
        const weatherRes = await getWeatherForCity(tripRes.data.destination);
        setWeather(weatherRes);
      } catch (err) {
        showError(err?.response?.data?.message || 'Unable to load trip details');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, showError]);

  const summary = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const budget = Number(trip?.budget || 0);
    const remaining = budget - totalExpenses;
    const usage = budget > 0 ? (totalExpenses / budget) * 100 : 0;
    return { totalExpenses, budget, remaining, usage };
  }, [expenses, trip]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!trip) {
    return <div className="card">Trip not found</div>;
  }

  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <h2>{trip.title}</h2>
          <p>{trip.destination} • {trip.start_date} → {trip.end_date}</p>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>Trip Details</h3>
          <p><strong>Destination:</strong> {trip.destination}</p>
          <p><strong>Budget:</strong> {trip.budget}</p>
          <p><strong>Notes:</strong> {trip.notes || 'No notes yet'}</p>
        </div>

        <div className="card">
          <h3>Weather</h3>
          {weather ? (
            <>
              <div className="weather-card">
                <div className="weather-card__icon"><FiCloud /></div>
                <div>
                  <div className="weather-card__temp">{weather.temperature}°C</div>
                  <div>{weather.city}</div>
                  <div>{weather.description}</div>
                </div>
              </div>
              <p>Humidity: {weather.humidity}%</p>
              <p>Chance of Rain: {weather.chanceOfRain}%</p>
              <p>Wind: {weather.windSpeed} km/h</p>
            </>
          ) : <p>Weather unavailable</p>}
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>Expense Summary</h3>
          <p>Budget: {summary.budget}</p>
          <p>Spent: {summary.totalExpenses}</p>
          <p>Remaining: {summary.remaining}</p>
          <ProgressBar value={summary.usage} label="Budget usage" />
        </div>
        <div className="card">
          <h3>Packing List</h3>
          <ul>
            <li>Travel documents</li>
            <li>Comfortable shoes</li>
            <li>Sunscreen</li>
            <li>Portable charger</li>
          </ul>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>AI Itinerary</h3>
          <p>Morning: Explore the city, Afternoon: local tasting tour, Evening: sunset walk.</p>
        </div>
        <div className="card">
          <h3>Map Placeholder</h3>
          <div className="map-placeholder"><FiMapPin /> Nearby map preview will appear here.</div>
        </div>
      </div>

      <div className="card">
        <h3>Recent Expenses</h3>
        <ul>
          {expenses.map((expense) => (
            <li key={expense.id}>{expense.category}: {expense.amount}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
