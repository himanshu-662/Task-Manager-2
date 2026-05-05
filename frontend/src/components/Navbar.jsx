import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, CheckSquare, Plus, User, Star } from 'lucide-react';
import { Button } from './common/UI';
import { useState, useEffect } from 'react';
import { api } from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(null);

  useEffect(() => {
    const fetchUserRating = async () => {
      if (!user) return;
      try {
        const tasks = await api.get('/task/');
        const userTasks = tasks.filter(t => t.assignedTo === user.email && t.qualityScore != null);
        if (userTasks.length > 0) {
          const avg = userTasks.reduce((acc, t) => acc + t.qualityScore, 0) / userTasks.length;
          setRating(avg.toFixed(1));
        }
      } catch (err) {
        console.error('Failed to fetch rating:', err);
      }
    };
    fetchUserRating();
  }, [user]);

  const getRatingColor = (r) => {
    const num = parseFloat(r);
    if (num <= 3) return '#ef4444';
    if (num <= 8) return '#f59e0b';
    return '#10b981';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="glass" style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 100, 
      padding: '0.75rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      margin: '1rem',
      borderRadius: 'var(--radius-md)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/dashboard" style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckSquare size={28} />
          <span>TaskManager</span>
        </Link>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/dashboard" className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            background: 'var(--primary-light)', 
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600
          }}>
            {user.name[0].toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</span>
              {rating && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '2px', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  color: getRatingColor(rating),
                  background: `${getRatingColor(rating)}15`,
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}>
                  <Star size={10} fill={getRatingColor(rating)} />
                  {rating}
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</span>
          </div>
        </div>

        <Button variant="ghost" onClick={handleLogout} style={{ padding: '0.5rem' }}>
          <LogOut size={20} />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
