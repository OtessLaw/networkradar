import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle } from 'lucide-react';

export function Login() {
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
      const res = await authService.login({ email, password });
      const user = res.data.user;
      setAuth(user, res.data.accessToken, res.data.refreshToken);

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdminDemo = () => {
    setEmail('admin@networkradar.gh');
    setPassword('Admin@123!');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <Card className="max-w-md w-full p-8 border border-slate-800 bg-slate-900/90 shadow-2xl rounded-3xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Sign In to NetworkRadar</h2>
          <p className="text-xs text-slate-400">Access your network dashboard & admin portal</p>
        </div>
        
        {error && (
          <div className="bg-red-500/15 text-red-400 p-3.5 rounded-2xl text-xs border border-red-500/30 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="admin@networkradar.gh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg cursor-pointer" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo Admin Quick Fill Button */}
        <div className="pt-4 border-t border-slate-800/80 text-center">
          <button
            onClick={handleFillAdminDemo}
            type="button"
            className="text-xs text-blue-400 hover:underline cursor-pointer font-semibold"
          >
            ⚡ Auto-fill Default Admin Credentials
          </button>
        </div>
        
        <p className="text-center text-xs text-slate-400">
          Don't have an account? <Link to="/register" className="text-blue-400 hover:underline font-bold">Sign up</Link>
        </p>
      </Card>
    </div>
  );
}

export default Login;
