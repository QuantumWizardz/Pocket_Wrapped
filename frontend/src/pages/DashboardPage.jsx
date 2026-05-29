import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [subDistribution, setSubDistribution] = useState([]);
  const [subDistType, setSubDistType] = useState('book');
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [statsRes, distRes, perfRes, subDistRes, recentRes] = await Promise.all([
        api.get('/events/stats'),
        api.get('/events/distribution'),
        api.get('/events/performance'),
        api.get('/events/subdistribution/book'),
        api.get('/events?limit=10')
      ]);
      setStats(statsRes.data);
      setDistribution(distRes.data);
      
      // Group performance data by month
      const monthlyPerf = perfRes.data.reduce((acc, curr) => {
        const d = new Date(curr.date);
        const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        acc[monthYear] = (acc[monthYear] || 0) + curr.count;
        return acc;
      }, {});
      
      const groupedPerformance = Object.keys(monthlyPerf).sort().map(key => ({
        date: key, // YYYY-MM
        count: monthlyPerf[key]
      }));
      
      setPerformance(groupedPerformance);
      setSubDistribution(subDistRes.data);
      setRecent(recentRes.data);
    };
    fetchData();
  }, [api]);

  useEffect(() => {
    const fetchSubDist = async () => {
      try {
        const res = await api.get(`/events/subdistribution/${subDistType}`);
        setSubDistribution(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (stats) fetchSubDist();
  }, [subDistType, api, stats]);

  if (!stats) return <div className="font-bold text-xl">Loading Data...</div>;

  const COLORS = ['#FDF598', '#000000', '#A0A0A0', '#ffcccb', '#add8e6', '#90ee90'];

  const bookHrs = Math.round(stats.book_minutes / 60) || 0;
  const movieHrs = Math.round(stats.movie_minutes / 60) || 0;
  const totalHrs = bookHrs + movieHrs + ((stats.travel_days || 0) * 24);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-5xl font-black uppercase tracking-tighter">Dashboard</h1>

      {/* Stat Cards - Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neo-card bg-accent flex flex-col justify-center items-center p-8">
          <span className="text-xl font-bold uppercase">Total Events</span>
          <span className="text-6xl font-black mt-2">{stats.total_events}</span>
        </div>
        
        <div className="neo-card flex flex-col justify-center items-center p-8 text-center">
          <span className="text-xl font-bold uppercase text-center mb-2">Time Spent</span>
          <span className="text-4xl font-black leading-none">{totalHrs} <span className="text-lg">total hrs</span></span>
          <hr className="w-1/2 border-black border-t-2 my-3" />
          <div className="flex flex-col w-full text-sm font-bold gap-1">
            <div className="flex justify-between border-b border-black pb-1"><span>Books</span><span>{bookHrs} hr</span></div>
            <div className="flex justify-between border-b border-black pb-1"><span>Movies</span><span>{movieHrs} hr</span></div>
            <div className="flex justify-between"><span>Travel</span><span>{stats.travel_days || 0} days</span></div>
          </div>
        </div>

        <div className="neo-card bg-black text-white flex flex-col justify-center items-center p-8">
          <span className="text-xl font-bold uppercase">Last Activity</span>
          <span className="text-2xl font-black mt-2 text-center">
            {stats.last_activity ? new Date(stats.last_activity).toLocaleDateString() : 'Never'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div className="neo-card flex flex-col items-center">
          <div className="flex justify-between items-center w-full border-b-2 border-black pb-2 mb-4">
            <h2 className="text-2xl font-black uppercase">Sub-Category Breakdown</h2>
            <select 
              className="neo-input !py-1 !text-sm" 
              value={subDistType} 
              onChange={e => setSubDistType(e.target.value)}
            >
              <option value="book">Books</option>
              <option value="movie">Movies</option>
              <option value="travel">Travel</option>
            </select>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={subDistribution} dataKey="event_count" nameKey="sub_category" cx="50%" cy="50%" outerRadius={80} stroke="#000" strokeWidth={2}>
                  {subDistribution.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ border: '2px solid black', borderRadius: '1rem', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Line Chart */}
        <div className="neo-card flex flex-col">
          <h2 className="text-2xl font-black uppercase mb-4 w-full border-b-2 border-black pb-2">Activity Tracker</h2>
          <div className="w-full h-64">
            <ResponsiveContainer>
              <LineChart data={performance}>
                <XAxis dataKey="date" tick={{ fill: '#000', fontWeight: 'bold', fontSize: 12 }} />
                <YAxis tick={{ fill: '#000', fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ border: '2px solid black', borderRadius: '1rem', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="count" stroke="#000" strokeWidth={4} activeDot={{ r: 8, fill: '#FDF598', stroke: '#000', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="neo-card">
        <h2 className="text-2xl font-black uppercase mb-4 border-b-2 border-black pb-2">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-sm uppercase">
                <th className="p-3">Content</th>
                <th className="p-3">Type</th>
                <th className="p-3">Date</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Rating</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((event) => (
                <tr key={event.event_id} className="border-b border-black last:border-b-0 hover:bg-gray-100 transition-colors font-bold">
                  <td className="p-3">{event.content_name}</td>
                  <td className="p-3"><span className="neo-badge uppercase">{event.content_type}</span></td>
                  <td className="p-3">{new Date(event.logged_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    {event.content_type === 'travel' ? `${event.duration} days` : `${Math.round(event.duration/60)} hrs`}
                  </td>
                  <td className="p-3 text-xl">{event.rating ? '★'.repeat(event.rating) : '-'}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan="5" className="p-4 text-center font-bold">No recent activity.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
