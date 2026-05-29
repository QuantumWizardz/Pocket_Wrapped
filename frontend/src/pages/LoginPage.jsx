import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-[80vh] gap-8">
      <div className="text-center">
        <h1 className="font-display font-black text-6xl tracking-tight">Pocket Wrapped</h1>
        <p className="font-bold text-lg mt-2">Your year, unwrapped.</p>
      </div>
      <div className="neo-card w-full max-w-md">
        <h1 className="text-4xl font-black mb-6 uppercase tracking-tighter">Login</h1>
        {error && <div className="bg-red-200 neo-border p-3 mb-4 font-bold rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-bold text-sm block mb-1">Username</label>
            <input type="text" className="neo-input" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div>
            <label className="font-bold text-sm block mb-1">Password</label>
            <input type="password" className="neo-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="neo-button mt-4 text-lg">Enter</button>
        </form>
        <p className="mt-6 text-center font-bold text-sm">
          New here? <Link to="/register" className="underline hover:text-accent">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
