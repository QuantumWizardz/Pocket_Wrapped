import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const InsightsPage = () => {
  const { api } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    try {
      setError('');
      const res = await api.get(`/insights/${year}`);
      setInsights(res.data);
    } catch (err) {
      setInsights(null);
      setError('No data found for this year.');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <h1 className="text-5xl font-black uppercase tracking-tighter text-center">Yearly Insights</h1>

      <div className="flex justify-center items-center gap-4">
        <input 
          type="number" 
          className="neo-input w-32 text-center text-xl font-bold" 
          value={year} 
          onChange={e => setYear(e.target.value)} 
        />
        <button onClick={fetchInsights} className="neo-button bg-black text-white">Generate</button>
      </div>

      {error && <div className="text-center font-bold text-red-600 bg-red-100 neo-border p-4 rounded-lg">{error}</div>}

      {insights && (
        <>
          <div className="flex justify-center gap-4">
            <span className="neo-badge text-lg px-4 py-2 bg-accent">Top Category: {insights.top_category}</span>
            <span className="neo-badge text-lg px-4 py-2">Peak Month: {insights.peak_month}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="neo-card bg-white flex flex-col justify-center items-center p-6 text-center">
              <span className="text-lg font-bold uppercase">Books</span>
              <span className="text-4xl font-black mt-2">{insights.book_minutes} <span className="text-sm">mins</span></span>
              <span className="text-sm font-bold mt-2 border-t-2 border-black w-full pt-2">{insights.book_count} books read</span>
            </div>
            <div className="neo-card bg-white flex flex-col justify-center items-center p-6 text-center">
              <span className="text-lg font-bold uppercase">Movies</span>
              <span className="text-4xl font-black mt-2">{insights.movie_minutes} <span className="text-sm">mins</span></span>
              <span className="text-sm font-bold mt-2 border-t-2 border-black w-full pt-2">{insights.movie_count} movies watched</span>
            </div>
            <div className="neo-card bg-accent flex flex-col justify-center items-center p-6 text-center">
              <span className="text-lg font-bold uppercase">Travel</span>
              <span className="text-4xl font-black mt-2">{insights.travel_days} <span className="text-sm">days</span></span>
              <span className="text-sm font-bold mt-2 border-t-2 border-black w-full pt-2">{insights.travel_count} places visited</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InsightsPage;
