import { CheckCircle2, Clock, Star, User, Edit, Trash2 } from 'lucide-react';
import { Card, Button } from './common/UI';
import { useState } from 'react';

const TaskCard = ({ task, onUpdate, onEdit, onDelete, userRole }) => {
  const [showEval, setShowEval] = useState(false);
  const [score, setScore] = useState(task.qualityScore || 0);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--danger)';
      case 'medium': return 'var(--warning)';
      default: return 'var(--info)';
    }
  };

  const getScoreColor = (score) => {
    const num = parseInt(score);
    if (num <= 3) return '#ef4444'; // Red
    if (num <= 8) return '#f59e0b'; // Orange
    return '#10b981'; // Green
  };

  const handleEvaluate = () => {
    onUpdate(task._id, { qualityScore: parseInt(score) });
    setShowEval(false);
  };

  const handleStatusChange = (e) => {
    onUpdate(task._id, { status: e.target.value });
  };

  return (
    <Card style={{ marginBottom: '1rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            color: (task.status === 'completed' || task.status === 'Done') ? 'var(--success)' : 'var(--border)',
          }}>
            <CheckCircle2 size={24} />
          </div>
          
          <div>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: 600, 
              textDecoration: (task.status === 'completed' || task.status === 'Done') ? 'line-through' : 'none',
              color: (task.status === 'completed' || task.status === 'Done') ? 'var(--text-muted)' : 'var(--text-main)'
            }}>
              {task.title}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.25rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} />
                {task.projectId?.name || 'No Project'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <User size={12} />
                {task.assignedTo || 'Unassigned'}
              </span>
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                color: getPriorityColor(task.priority),
                background: `${getPriorityColor(task.priority)}10`,
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {task.priority}
              </span>
              {task.qualityScore !== null && task.qualityScore !== undefined && (
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  color: getScoreColor(task.qualityScore),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  background: `${getScoreColor(task.qualityScore)}15`,
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  <Star size={12} fill={getScoreColor(task.qualityScore)} />
                  Score: {task.qualityScore}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select 
            value={task.status} 
            onChange={handleStatusChange}
            style={{ 
              fontSize: '0.75rem', 
              padding: '4px 8px', 
              borderRadius: '6px', 
              border: '1px solid var(--border)',
              background: 'var(--background)'
            }}
          >
            <option value="pending">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Done</option>
          </select>

          {userRole === 'admin' && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEdit(task)}
                style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                title="Edit Task"
              >
                <Edit size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(task._id)}
                style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger)' }}
                title="Delete Task"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          )}

          {userRole === 'admin' && (task.status === 'completed' || task.status === 'Done') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowEval(!showEval)}
              style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--primary)' }}
            >
              Evaluate
            </Button>
          )}
        </div>
      </div>

      {showEval && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          background: 'var(--primary-light)', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Quality Score (1-10):</span>
          <input 
            type="number" 
            min="1" 
            max="10" 
            value={score} 
            onChange={(e) => setScore(e.target.value)}
            style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border)' }}
          />
          <Button size="sm" onClick={handleEvaluate}>Save Score</Button>
        </div>
      )}
    </Card>
  );
};

export default TaskCard;