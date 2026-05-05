import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button, Card, Input } from '../components/common/UI';
import { LogIn, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/auth/login', formData);
      login(data.user, data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '2rem'
    }}>
      <Card style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            background: 'var(--primary)', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <LogIn size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)' }}>Login to manage your tasks efficiently</p>
        </div>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <Input 
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input 
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">I am a...</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['member', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`btn ${formData.role === r ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, textTransform: 'capitalize' }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            style={{ width: '100%', marginBottom: '1.5rem' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create account</Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;