import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await authService.register({ name, email, password });
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Join NetworkRadar</h2>
        
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 border border-red-500/50">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-lg p-3 text-white focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-lg p-3 text-white focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-lg p-3 text-white focus:ring-primary focus:border-primary"
              minLength={6}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
        
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-primary-light hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}

export default Register;

