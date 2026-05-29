import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-[80vh] gap-8">
      <div className="text-center">
        <h1 className="font-display font-black text-6xl tracking-tight">Pocket Wrapped</h1>
        <p className="font-bold text-lg mt-2">Your year, unwrapped.</p>
      </div>
      <div className="neo-card w-full max-w-md bg-accent">
        <h1 className="text-4xl font-black mb-6 uppercase tracking-tighter">Register</h1>
        {error && <div className="bg-red-200 neo-border p-3 mb-4 font-bold rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-bold text-sm block mb-1">Username</label>
            <input type="text" className="neo-input" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div>
            <label className="font-bold text-sm block mb-1">Email</label>
            <input type="email" className="neo-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="font-bold text-sm block mb-1">Password</label>
            <input type="password" className="neo-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="neo-button-dark mt-4 text-lg">Create Account</button>
        </form>
        <p className="mt-6 text-center font-bold text-sm">
          Already have an account? <Link to="/login" className="underline hover:text-white">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
