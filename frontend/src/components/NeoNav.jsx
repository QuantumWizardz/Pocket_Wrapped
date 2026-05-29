import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, PlusCircle, BarChart2, Star, Calendar } from 'lucide-react';

const NeoNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="w-full p-4 flex justify-center sticky top-0 z-50">
      <nav className="neo-border bg-white rounded-full px-6 py-3 flex items-center justify-between w-full max-w-6xl shadow-sm overflow-x-auto no-scrollbar">
        <div className="font-display font-black text-2xl tracking-tight whitespace-nowrap">
          <Link to="/dashboard">Pocket Wrapped</Link>
        </div>
        
        <div className="flex items-center gap-10 font-bold text-sm whitespace-nowrap mx-8">
          <Link to="/dashboard" className="flex items-center gap-1 hover:text-gray-600"><Home size={16}/> Dashboard</Link>
          <Link to="/add-event" className="flex items-center gap-1 hover:text-gray-600"><PlusCircle size={16}/> Log Event</Link>
          <Link to="/recommendations" className="flex items-center gap-1 hover:text-gray-600"><Star size={16}/> Picks</Link>
          <Link to="/insights" className="flex items-center gap-1 hover:text-gray-600"><BarChart2 size={16}/> Insights</Link>
          <Link to="/recap" className="flex items-center gap-1 hover:text-gray-600"><Calendar size={16}/> Recap</Link>
        </div>

        <div className="flex items-center gap-4 ml-auto whitespace-nowrap">
          <span className="font-bold text-sm bg-accent neo-border px-3 py-1 rounded-full">{user.username}</span>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="neo-button-dark !px-3 !py-1 text-sm flex items-center gap-1"
          >
            <LogOut size={14} /> Exit
          </button>
        </div>
      </nav>
    </div>
  );
};

export default NeoNav;
