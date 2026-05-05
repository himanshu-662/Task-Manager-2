import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input } from '../components/common/UI';
import TaskCard from '../components/TaskCard';
import { 
  Plus, Layout, ListChecks, Clock, AlertCircle, 
  BarChart3, Users, FolderPlus, Search, Filter,
  Activity, Zap
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  const [newTask, setNewTask] = useState({ 
    title: '', 
    projectId: '', 
    priority: 'medium', 
    status: 'pending',
    assignedTo: '' 
  });

  const [newProject, setNewProject] = useState({ name: '' });

  const fetchData = async () => {
    try {
      const [tasksData, projectsData] = await Promise.all([
        api.get('/task/'),
        api.get('/project/')
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
      
      if (user.role === 'admin') {
        const usersData = await api.get('/auth/users');
        setMembers(usersData.filter(u => u.role === 'member'));
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Tasks Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchTerm, filterPriority]);

  // Status Chart Data
  const statusChartData = useMemo(() => {
    const counts = {
      pending: tasks.filter(t => t.status === 'pending' || t.status === 'To Do').length,
      inProgress: tasks.filter(t => t.status === 'in-progress' || t.status === 'In Progress').length,
      completed: tasks.filter(t => t.status === 'completed' || t.status === 'Done').length,
    };
    return [
      { name: 'To Do', value: counts.pending, color: '#f59e0b' },
      { name: 'In Progress', value: counts.inProgress, color: '#0ea5e9' },
      { name: 'Completed', value: counts.completed, color: '#10b981' },
    ].filter(item => item.value > 0);
  }, [tasks]);

  // Activity Pulse Data (Group by Priority)
  const activityPulseData = useMemo(() => {
    const priorityCounts = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };
    return [
      { name: 'High', count: priorityCounts.high, color: '#ef4444' },
      { name: 'Medium', count: priorityCounts.medium, color: '#f59e0b' },
      { name: 'Low', count: priorityCounts.low, color: '#0ea5e9' },
    ];
  }, [tasks]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/task/', newTask);
      toast.success('Task created and assigned!');
      setNewTask({ title: '', projectId: '', priority: 'medium', status: 'pending', assignedTo: '' });
      setShowTaskForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create task');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/project/', newProject);
      toast.success('Project created!');
      setNewProject({ name: '' });
      setShowProjectForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create project');
    }
  };

  const handleUpdateTask = async (id, updates) => {
    try {
      await api.put(`/task/${id}`, updates);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  const stats = [
    { label: 'Total Tasks', value: tasks.length, icon: <Layout size={20} />, color: 'var(--primary)' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'completed' || t.status === 'Done').length, icon: <ListChecks size={20} />, color: '#10b981' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress' || t.status === 'In Progress').length, icon: <Clock size={20} />, color: '#0ea5e9' },
    { label: 'To Do', value: tasks.filter(t => t.status === 'pending' || t.status === 'To Do').length, icon: <AlertCircle size={20} />, color: '#f59e0b' },
  ];

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your workspace...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Workspace</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user.name} ({user.role})!</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {user.role === 'admin' && (
            <>
              <Button variant="ghost" onClick={() => setShowProjectForm(true)} style={{ gap: '0.5rem', border: '1px solid var(--border)' }}>
                <FolderPlus size={20} />
                <span>New Project</span>
              </Button>
              <Button onClick={() => setShowTaskForm(true)} style={{ gap: '0.5rem' }}>
                <Plus size={20} />
                <span>New Task</span>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        {/* Status Distribution */}
        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: '320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Activity size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Task Distribution</h3>
          </div>
          <div style={{ flex: 1 }}>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No task data yet
              </div>
            )}
          </div>
        </Card>

        {/* Priority Activity Pulse */}
        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: '320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Zap size={18} color="var(--warning)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Priority Pulse</h3>
          </div>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityPulseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {activityPulseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Stats Mini Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map((stat, i) => (
          <Card key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: `${stat.color}15`, 
              color: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.125rem' }}>{stat.label}</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search tasks by title..." 
            className="input-field"
            style={{ paddingLeft: '40px', width: '100%', marginBottom: 0 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={18} color="var(--text-muted)" />
          <select 
            className="input-field" 
            style={{ width: '150px', marginBottom: 0 }}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
        {/* Task List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <BarChart3 size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {searchTerm || filterPriority !== 'all' ? 'Filtered Tasks' : 'Active Tasks'} 
              <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                ({filteredTasks.length})
              </span>
            </h2>
          </div>
          
          {filteredTasks.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
              <p style={{ color: 'var(--text-muted)' }}>
                {tasks.length === 0 ? 'No tasks found.' : 'No tasks match your filters.'}
              </p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredTasks.map(task => (
                <TaskCard key={task._id} task={task} onUpdate={handleUpdateTask} userRole={user.role} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>Projects</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {projects.map(p => (
                <div key={p._id} style={{ 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  background: 'var(--background)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                  {p.name}
                </div>
              ))}
              {projects.length === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No projects available.</p>}
            </div>
          </Card>

          {user.role === 'admin' && (
            <Card>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} />
                Team Members
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {members.map(m => (
                  <div key={m.email} style={{ fontSize: '0.875rem' }}>
                    <p style={{ fontWeight: 600 }}>{m.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{m.email}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {showProjectForm && (
        <div className="modal-overlay">
          <Card style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <Input 
                label="Project Name"
                placeholder="e.g. Marketing Q3"
                required
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="ghost" onClick={() => setShowProjectForm(false)} style={{ flex: 1 }}>Cancel</Button>
                <Button type="submit" style={{ flex: 1 }}>Create Project</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* New Task Modal */}
      {showTaskForm && (
        <div className="modal-overlay">
          <Card style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <Input 
                label="Task Title"
                placeholder="What needs to be done?"
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="input-label">Project</label>
                <select 
                  className="input-field" 
                  style={{ width: '100%' }}
                  required
                  value={newTask.projectId}
                  onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                >
                  <option value="">Select a project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="input-label">Assign To Member</label>
                <select 
                  className="input-field" 
                  style={{ width: '100%' }}
                  required
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                >
                  <option value="">Select a member</option>
                  {members.map(m => <option key={m.email} value={m.email}>{m.name} ({m.email})</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="input-label">Priority</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['low', 'medium', 'high'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      className={`btn ${newTask.priority === p ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ flex: 1, textTransform: 'capitalize' }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="ghost" onClick={() => setShowTaskForm(false)} style={{ flex: 1 }}>Cancel</Button>
                <Button type="submit" style={{ flex: 1 }}>Create Task</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
