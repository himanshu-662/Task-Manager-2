import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button, Card, Input } from '../components/common/UI';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/auth/signup', formData);
      login(data.user, data.token);
      toast.success('Account created successfully!');
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
      <Card style={{ width: '100%', maxWidth: '450px', textAlign: 'center' }}>
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
            <UserPlus size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Join TaskManager</h1>
          <p style={{ color: 'var(--text-muted)' }}>Start organizing your projects today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <Input 
            label="Full Name"
            type="text"
            placeholder="John Doe"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
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
            placeholder="Min. 8 characters"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Select Role</label>
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
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </Card>
    </div>
  );
};

export default Signup;