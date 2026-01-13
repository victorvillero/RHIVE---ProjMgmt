import React, { useState, useEffect } from 'react';
import { ProjectTable } from './components/ProjectTable';
import { ProjectDetail } from './components/ProjectDetail';
import { ChatOverlay } from './components/ChatOverlay';
import { VideoConference } from './components/VideoConference';
import { Project, User, Task, ChatSession, ChatMessage } from './types';
import { Search, Bell, Settings, LogOut, LayoutGrid, Folder, Globe, Archive, Lock, User as UserIcon, Shield, Trash2, RefreshCw, X, Image as ImageIcon, Plus, AlignLeft, Flag } from 'lucide-react';

// --- BACKEND SIMULATION & MOCK DATA ---

const DEFAULT_PASSWORD = 'RHive12345';

const INITIAL_USERS: User[] = [
  { id: 'admin', username: 'admin', email: 'admin@rhiveconstruction.com', name: 'Administrator', avatar: 'https://picsum.photos/200/200?random=99', password: 'admin123', isFirstLogin: false, role: 'admin' },
  { id: 'u1', username: 'michael.r', email: 'michael.r@rhiveconstruction.com', name: 'Michael Rob', avatar: 'https://picsum.photos/200/200?random=1', password: DEFAULT_PASSWORD, isFirstLogin: true, role: 'user' },
  { id: 'u2', username: 'kara.r', email: 'kara.r@rhiveconstruction.com', name: 'Kara Robins', avatar: 'https://picsum.photos/200/200?random=2', password: DEFAULT_PASSWORD, isFirstLogin: true, role: 'user' },
  { id: 'u3', username: 'victor.v', email: 'victor.v@rhiveconstruction.com', name: 'Victor Viller', avatar: 'https://picsum.photos/200/200?random=3', password: DEFAULT_PASSWORD, isFirstLogin: true, role: 'user' },
  { id: 'u4', username: 'van.v', email: 'van.v@rhiveconstruction.com', name: 'Vanessa Pol', avatar: 'https://picsum.photos/200/200?random=4', password: DEFAULT_PASSWORD, isFirstLogin: true, role: 'user' },
  { id: 'u5', username: 'sheena.l', email: 'sheena.l@rhiveconstruction.com', name: 'Sheena Les', avatar: 'https://picsum.photos/200/200?random=5', password: DEFAULT_PASSWORD, isFirstLogin: true, role: 'user' },
  { id: 'u6', username: 'james.g', email: 'james.g@rhiveconstruction.com', name: 'James Gime', avatar: 'https://picsum.photos/200/200?random=6', password: DEFAULT_PASSWORD, isFirstLogin: true, role: 'user' },
  { id: 'u7', username: 'maureen.g', email: 'maureen.g@rhiveconstruction.com', name: 'Maureen G', avatar: 'https://picsum.photos/200/200?random=7', password: DEFAULT_PASSWORD, isFirstLogin: true, role: 'user' },
];

// Helper to generate random tasks
const generateTasks = (count: number, assignee: User): Task[] => {
    const statuses: Task['status'][] = ['Open', 'In Progress', 'On Hold', 'Done'];
    const priorities: Task['priority'][] = ['Low', 'Medium', 'High'];
    const tasks: Task[] = [];
    const taskNames = [
        "Review Q3 Requirements", "Update User Flow", "Fix Mobile Padding", 
        "Database Schema Sync", "Client Meeting Prep", "Deploy to Staging", 
        "Write Integration Tests", "Accessibility Audit", "Update API Docs", 
        "Email Automation Setup"
    ];
    
    for (let i = 0; i < count; i++) {
        tasks.push({
            id: `t-${Math.random().toString(36).substr(2, 9)}`,
            name: taskNames[Math.floor(Math.random() * taskNames.length)],
            description: "Detailed description of the task requirements and acceptance criteria should go here.",
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            assignee: assignee, 
            status: statuses[Math.floor(Math.random() * statuses.length)],
            startDate: '2025-02-12',
            dueDate: '2025-02-28'
        });
    }
    return tasks;
};

// Initial Mock Projects if LocalStorage is empty
const getInitialProjects = (users: User[]): Project[] => {
    // Helper to find user by partial name or default to first
    const findUser = (namePart: string) => users.find(u => u.username.includes(namePart)) || users[1]; // default to non-admin

    const projects: Project[] = [
        {
            id: '1', projectId: 'PRO-01', name: 'Event Planner App', percent: 0, owner: findUser('kara'), status: 'Active', tasksCompleted: 0, tasksTotal: 0, startDate: '2024-06-01', endDate: '2024-09-01', tasks: generateTasks(5, findUser('kara'))
        },
        {
            id: '2', projectId: 'PRO-02', name: 'Website Redesign', percent: 0, owner: findUser('van'), status: 'In Testing', tasksCompleted: 0, tasksTotal: 0, startDate: '2024-08-15', endDate: '2024-10-30', isTemplate: true, tasks: generateTasks(3, findUser('van'))
        },
        {
            id: '3', projectId: 'PRO-03', name: "Q4 Marketing Strategy", percent: 0, owner: findUser('victor'), status: 'On Track', tasksCompleted: 0, tasksTotal: 0, startDate: '2024-07-01', endDate: '2024-12-31', tasks: generateTasks(8, findUser('victor'))
        },
        {
            id: '4', projectId: 'PRO-04', name: "Mobile API Integration", percent: 0, owner: findUser('james'), status: 'In Testing', tasksCompleted: 0, tasksTotal: 0, startDate: '2024-05-10', endDate: '2024-06-20', tasks: generateTasks(2, findUser('james'))
        },
        {
            id: '5', projectId: 'PRO-05', name: "Customer Feedback Loop", percent: 0, owner: findUser('van'), status: 'Delayed', tasksCompleted: 0, tasksTotal: 0, startDate: '2024-06-15', endDate: '2024-08-15', tasks: generateTasks(4, findUser('van'))
        },
        {
            id: '6', projectId: 'PRO-06', name: "Internal Audit", percent: 0, owner: findUser('sheena'), status: 'Active', tasksCompleted: 0, tasksTotal: 0, startDate: '2024-09-01', endDate: '2024-11-01', tasks: generateTasks(6, findUser('sheena'))
        },
        {
            id: '7', projectId: 'PRO-07', name: "New Hire Onboarding", percent: 0, owner: findUser('michael'), status: 'On Track', tasksCompleted: 0, tasksTotal: 0, startDate: '2024-01-01', endDate: '2024-12-31', tasks: generateTasks(3, findUser('michael'))
        },
        {
            id: '8', projectId: 'PRO-08', name: "AI Research Phase 1", percent: 0, owner: findUser('kara'), status: 'In Progress', tasksCompleted: 0, tasksTotal: 0, startDate: '2024-08-01', endDate: '2025-02-01', tasks: generateTasks(5, findUser('kara'))
        },
        {
            id: '9', projectId: 'PRO-09', name: "Database Migration", percent: 0, owner: findUser('maureen'), status: 'Delayed', tasksCompleted: 0, tasksTotal: 0, startDate: '2024-03-01', endDate: '2024-07-30', tasks: generateTasks(7, findUser('maureen'))
        },
        {
            id: '10', projectId: 'PRO-10', name: "Security Compliance", percent: 0, owner: findUser('maureen'), status: 'On Track', tasksCompleted: 0, tasksTotal: 0, startDate: '2024-02-01', endDate: '2024-10-01', tasks: generateTasks(4, findUser('maureen'))
        },
    ];

    return projects.map(p => {
        // Initial Calculation
        if (!p.tasks) return p;
        const completed = p.tasks.filter(t => t.status === 'Done').length;
        return {
            ...p,
            tasksCompleted: completed,
            tasksTotal: p.tasks.length,
            percent: Math.round((completed / p.tasks.length) * 100)
        };
    });
};

const getInitialChats = (users: User[]): ChatSession[] => {
     return [
        {
            id: 'c1',
            name: 'Project Alpha Team',
            type: 'group',
            participants: [users[1], users[2]],
            unread: 3,
            messages: [
                { id: '1', senderId: users[1].id, senderName: users[1].name, text: 'Hey everyone, check the latest designs.', timestamp: new Date().toISOString() },
                { id: '2', senderId: users[2].id, senderName: users[2].name, text: 'Looks great! Approved.', timestamp: new Date().toISOString() }
            ]
        }
    ];
};

// --- COMPONENTS ---

// 1. Password Reset Modal
const ChangePasswordModal: React.FC<{ onSave: (newPass: string) => void }> = ({ onSave }) => {
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (newPass.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (newPass !== confirmPass) {
            setError('Passwords do not match.');
            return;
        }
        onSave(newPass);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
             <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-amber-500/10 p-4 rounded-full mb-3 text-amber-400">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Change Password</h2>
                    <p className="text-slate-400 text-center text-sm mt-2">
                        For security reasons, you must change your default password before continuing.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
                        <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
                        <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                    </div>
                    {error && <p className="text-rose-500 text-sm">{error}</p>}
                    <button onClick={handleSubmit} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-lg transition-colors mt-2">
                        Update Password & Login
                    </button>
                </div>
             </div>
        </div>
    );
};

// 2. Login Page
const LoginPage: React.FC<{ onLogin: (u: string, p: string) => void; error: string }> = ({ onLogin, error }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl w-full max-w-md z-10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-teal-500 to-purple-600 rounded-xl mx-auto mb-4 shadow-lg flex items-center justify-center">
                        <LayoutGrid className="text-white" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-400">Enter your username to access the workspace.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                        <div className="relative">
                            <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="michael.r" 
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <div className="relative">
                             <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors" 
                            />
                        </div>
                    </div>
                    {error && <p className="text-rose-400 text-sm text-center">{error}</p>}
                    <button onClick={() => onLogin(username, password)} className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-teal-500/20">
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};

// 3. Admin User Management Modal
const AdminUserManagement: React.FC<{ users: User[]; onClose: () => void; onAddUser: (u: User) => void; onRemoveUser: (id: string) => void; onResetPassword: (id: string) => void }> = ({ users, onClose, onAddUser, onRemoveUser, onResetPassword }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', email: '', name: '' });

    const handleCreateUser = () => {
        if (!newUser.username || !newUser.email || !newUser.name) return;
        const u: User = {
            id: `u-${Date.now()}`,
            username: newUser.username,
            email: newUser.email,
            name: newUser.name,
            avatar: `https://picsum.photos/200/200?random=${Date.now()}`,
            password: DEFAULT_PASSWORD,
            isFirstLogin: true,
            role: 'user'
        };
        onAddUser(u);
        setNewUser({ username: '', email: '', name: '' });
        setIsAdding(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
             <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Shield className="text-teal-500"/> User Management</h2>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-white"/></button>
                </div>
                
                <div className="p-6 flex-1 overflow-auto">
                    {isAdding ? (
                         <div className="bg-slate-800/50 p-4 rounded-xl mb-6 border border-slate-700">
                            <h3 className="font-bold text-white mb-4">Add New User</h3>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <input placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                                <input placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                                <input placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                                <button onClick={handleCreateUser} className="px-4 py-2 bg-teal-600 rounded text-white font-bold hover:bg-teal-500">Create User</button>
                            </div>
                         </div>
                    ) : (
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-teal-500 text-slate-950 px-4 py-2 rounded-lg font-bold hover:bg-teal-400">
                                <Plus size={18}/> Add User
                            </button>
                        </div>
                    )}

                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800/50 text-slate-400">
                            <tr>
                                <th className="p-3 rounded-tl-lg">User</th>
                                <th className="p-3">Username</th>
                                <th className="p-3">Role</th>
                                <th className="p-3 text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-800/30">
                                    <td className="p-3 flex items-center gap-3">
                                        <img src={u.avatar} className="w-8 h-8 rounded-full" alt=""/>
                                        <span className="text-white">{u.name}</span>
                                    </td>
                                    <td className="p-3 text-slate-400">{u.username}</td>
                                    <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-300'}`}>{u.role || 'user'}</span></td>
                                    <td className="p-3 text-right">
                                        {u.role !== 'admin' && (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => onResetPassword(u.id)} title="Reset Password" className="p-1.5 hover:bg-slate-700 rounded text-amber-500"><RefreshCw size={16}/></button>
                                                <button onClick={() => onRemoveUser(u.id)} title="Remove User" className="p-1.5 hover:bg-slate-700 rounded text-rose-500"><Trash2 size={16}/></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>
    );
};

// 4. Profile Settings Modal
const ProfileSettings: React.FC<{ user: User; onClose: () => void; onUpdateAvatar: (url: string) => void }> = ({ user, onClose, onUpdateAvatar }) => {
    const [avatarUrl, setAvatarUrl] = useState(user.avatar);
    
    const handleRandomize = () => {
        setAvatarUrl(`https://picsum.photos/200/200?random=${Date.now()}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
             <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-white"/></button>
                </div>
                
                <div className="flex flex-col items-center mb-6">
                    <div className="relative group cursor-pointer" onClick={handleRandomize}>
                        <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-slate-800" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <RefreshCw size={24} className="text-white" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Click image to randomize</p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Image URL</label>
                    <div className="flex gap-2">
                        <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white text-sm" />
                    </div>
                </div>

                <button onClick={() => { onUpdateAvatar(avatarUrl); onClose(); }} className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 rounded-lg transition-colors">
                    Save Changes
                </button>
             </div>
        </div>
    );
};

// 5. New Project Modal
const NewProjectModal: React.FC<{ users: User[]; currentUser: User; onClose: () => void; onCreate: (project: Project) => void }> = ({ users, currentUser, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const handleCreate = () => {
        if(!name || !startDate || !endDate) return;
        
        const newProject: Project = {
            id: `p-${Date.now()}`,
            projectId: `PRO-${Math.floor(Math.random() * 1000)}`,
            name,
            percent: 0,
            owner: currentUser,
            status: 'Active',
            tasksCompleted: 0,
            tasksTotal: 0,
            startDate,
            endDate,
            tasks: []
        };
        onCreate(newProject);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">Create New Project</h2>
                <div className="space-y-4">
                    <input placeholder="Project Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white" />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500">Start Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">End Date</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={onClose} className="px-4 py-2 text-slate-400">Cancel</button>
                        <button onClick={handleCreate} className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded">Create Project</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 6. New Task Modal
const NewTaskModal: React.FC<{ users: User[]; onClose: () => void; onCreate: (task: Omit<Task, 'id'>) => void }> = ({ users, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Task['priority']>('Medium');
    const [assigneeId, setAssigneeId] = useState(users[0]?.id || '');
    const [dueDate, setDueDate] = useState('');

    const handleCreate = () => {
        if(!name || !assigneeId) return;
        const assignee = users.find(u => u.id === assigneeId) || users[0];
        onCreate({
            name,
            description,
            priority,
            assignee,
            status: 'Open',
            startDate: new Date().toISOString().split('T')[0],
            dueDate
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Add New Task</h2>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-white"/></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Task Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500" />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Assignee</label>
                            <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500">
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                             <select value={priority} onChange={e => setPriority(e.target.value as Task['priority'])} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500">
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                             </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500" />
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                        <button onClick={handleCreate} className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded hover:bg-teal-400 transition-colors">Create Task</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  // App Data State (The "Backend")
  const [dbUsers, setDbUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState('All Projects');
  const [inVideoCall, setInVideoCall] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewTask, setShowNewTask] = useState<string | null>(null); // holds project ID

  // --- INITIALIZATION (Load from LocalStorage) ---
  useEffect(() => {
    // 1. Load Users
    const storedUsers = localStorage.getItem('rhive_users');
    let loadedUsers: User[] = [];
    if (storedUsers) {
        loadedUsers = JSON.parse(storedUsers);
        // Ensure Admin exists if it wasn't there before
        if (!loadedUsers.find(u => u.username === 'admin')) {
            loadedUsers = [...INITIAL_USERS.filter(u => u.role === 'admin'), ...loadedUsers];
        }
        setDbUsers(loadedUsers);
    } else {
        loadedUsers = INITIAL_USERS;
        setDbUsers(loadedUsers);
        localStorage.setItem('rhive_users', JSON.stringify(loadedUsers));
    }

    // 2. Load Projects
    const storedProjects = localStorage.getItem('rhive_projects');
    if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
    } else {
        const initial = getInitialProjects(loadedUsers);
        setProjects(initial);
        localStorage.setItem('rhive_projects', JSON.stringify(initial));
    }

    // 3. Load Chats
    const storedChats = localStorage.getItem('rhive_chats');
    if (storedChats) {
        setChats(JSON.parse(storedChats));
    } else {
        const initial = getInitialChats(loadedUsers);
        setChats(initial);
        localStorage.setItem('rhive_chats', JSON.stringify(initial));
    }
  }, []);

  // --- AUTH HANDLERS ---
  const handleLogin = (u: string, p: string) => {
    const user = dbUsers.find(user => user.username.toLowerCase() === u.toLowerCase());
    
    if (user && user.password === p) {
        setCurrentUser(user);
        setLoginError('');
        if (user.isFirstLogin) {
            setShowChangePassword(true);
        }
    } else {
        setLoginError('Invalid username or password.');
    }
  };

  const handlePasswordUpdate = (newPass: string) => {
      if (!currentUser) return;
      
      const updatedUser = { ...currentUser, password: newPass, isFirstLogin: false };
      const updatedDbUsers = dbUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
      
      // Update State & DB
      setDbUsers(updatedDbUsers);
      setCurrentUser(updatedUser);
      setShowChangePassword(false);
      localStorage.setItem('rhive_users', JSON.stringify(updatedDbUsers));
  };

  // --- ADMIN HANDLERS ---
  const handleAddUser = (u: User) => {
      const updated = [...dbUsers, u];
      setDbUsers(updated);
      localStorage.setItem('rhive_users', JSON.stringify(updated));
  };

  const handleRemoveUser = (id: string) => {
      const updated = dbUsers.filter(u => u.id !== id);
      setDbUsers(updated);
      localStorage.setItem('rhive_users', JSON.stringify(updated));
  };

  const handleResetUserPassword = (id: string) => {
      const updated = dbUsers.map(u => u.id === id ? { ...u, password: DEFAULT_PASSWORD, isFirstLogin: true } : u);
      setDbUsers(updated);
      localStorage.setItem('rhive_users', JSON.stringify(updated));
      alert("Password reset to default.");
  };

  // --- PROFILE HANDLERS ---
  const handleUpdateAvatar = (url: string) => {
      if (!currentUser) return;
      const updatedUser = { ...currentUser, avatar: url };
      const updatedDbUsers = dbUsers.map(u => u.id === currentUser.id ? updatedUser : u);
      setDbUsers(updatedDbUsers);
      setCurrentUser(updatedUser);
      localStorage.setItem('rhive_users', JSON.stringify(updatedDbUsers));
  };

  // --- PROJECT/TASK HANDLERS ---
  const handleCreateProject = (newProject: Project) => {
      const updated = [newProject, ...projects];
      setProjects(updated);
      localStorage.setItem('rhive_projects', JSON.stringify(updated));
  };

  const handleCreateTask = (taskData: Omit<Task, 'id'>) => {
      if (!showNewTask) return;
      const projectId = showNewTask;
      
      const newTask: Task = {
          id: `t-${Date.now()}`,
          ...taskData
      };

      const updatedProjects = projects.map(p => {
          if (p.id !== projectId) return p;
          const currentTasks = p.tasks || [];
          const updatedTasks = [...currentTasks, newTask];
          const completedCount = updatedTasks.filter(t => t.status === 'Done').length;
          const newPercent = Math.round((completedCount / updatedTasks.length) * 100);
          
          return {
              ...p,
              tasks: updatedTasks,
              tasksCompleted: completedCount,
              tasksTotal: updatedTasks.length,
              percent: newPercent
          };
      });

      setProjects(updatedProjects);
      localStorage.setItem('rhive_projects', JSON.stringify(updatedProjects));
  };

  const handleUpdateStatus = (id: string, newStatus: Project['status']) => {
    const updated = projects.map(p => p.id === id ? { ...p, status: newStatus } : p);
    setProjects(updated);
    localStorage.setItem('rhive_projects', JSON.stringify(updated));
  };

  const handleUpdateTaskStatus = (projectId: string, taskId: string, newStatus: Task['status']) => {
    const updated = projects.map(p => {
        if (p.id !== projectId) return p;
        if (!p.tasks) return p;

        const updatedTasks = p.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        const completedCount = updatedTasks.filter(t => t.status === 'Done').length;
        const newPercent = Math.round((completedCount / updatedTasks.length) * 100);

        return {
            ...p,
            tasks: updatedTasks,
            tasksCompleted: completedCount,
            percent: newPercent
        };
    });
    setProjects(updated);
    localStorage.setItem('rhive_projects', JSON.stringify(updated));
  };

  const handleSendMessage = (sessionId: string, text: string) => {
      if (!currentUser) return;
      const updatedChats = chats.map(c => {
          if (c.id === sessionId) {
              const msg: ChatMessage = {
                  id: Date.now().toString(),
                  senderId: currentUser.id,
                  senderName: currentUser.name,
                  text: text,
                  timestamp: new Date().toISOString()
              };
              return { ...c, messages: [...c.messages, msg] };
          }
          return c;
      });
      setChats(updatedChats);
      localStorage.setItem('rhive_chats', JSON.stringify(updatedChats));
  };


  // --- RENDER ---

  if (!currentUser) {
      return <LoginPage onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 relative overflow-hidden font-sans">
      {showChangePassword && <ChangePasswordModal onSave={handlePasswordUpdate} />}
      {showAdminPanel && <AdminUserManagement users={dbUsers} onClose={() => setShowAdminPanel(false)} onAddUser={handleAddUser} onRemoveUser={handleRemoveUser} onResetPassword={handleResetUserPassword} />}
      {showProfileSettings && <ProfileSettings user={currentUser} onClose={() => setShowProfileSettings(false)} onUpdateAvatar={handleUpdateAvatar} />}
      {showNewProject && <NewProjectModal users={dbUsers} currentUser={currentUser} onClose={() => setShowNewProject(false)} onCreate={handleCreateProject} />}
      {showNewTask && <NewTaskModal users={dbUsers} onClose={() => setShowNewTask(null)} onCreate={handleCreateTask} />}

      {/* Top Header */}
      <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-20">
        <div className="flex items-center space-x-4">
          <div className="bg-teal-500/10 p-2 rounded-lg text-teal-400">
             <LayoutGrid size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">RHIVE<span className="text-teal-500"> Project Tracker</span></h1>
        </div>
        
        <div className="flex items-center space-x-6 text-slate-400">
           <div className="relative group">
                <Search size={20} className="group-hover:text-white transition-colors cursor-pointer" />
           </div>
           <div className="relative group">
             <Bell size={20} className="group-hover:text-white transition-colors cursor-pointer" />
             <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-slate-900">3</span>
           </div>
           
           <div className="relative group">
                <Settings size={20} className="hover:text-white transition-colors cursor-pointer" />
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                    <button onClick={() => setShowProfileSettings(true)} className="w-full text-left px-4 py-2 hover:bg-slate-800 text-sm text-slate-300 flex items-center gap-2">
                        <UserIcon size={14}/> Edit Profile
                    </button>
                    {currentUser.role === 'admin' && (
                        <button onClick={() => setShowAdminPanel(true)} className="w-full text-left px-4 py-2 hover:bg-slate-800 text-sm text-teal-400 font-bold flex items-center gap-2">
                            <Shield size={14}/> Admin Panel
                        </button>
                    )}
                </div>
           </div>

           <div className="h-8 w-[1px] bg-slate-800"></div>
           <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setCurrentUser(null)}>
                <img src={currentUser.avatar} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-slate-700 group-hover:border-teal-500 transition-colors" />
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">@{currentUser.username}</p>
                </div>
                <LogOut size={16} className="ml-2 group-hover:text-rose-400" />
           </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-slate-950 border-r border-slate-800 hidden md:flex flex-col py-6">
              <nav className="flex-1 px-4 space-y-1">
                  {[
                      { name: 'All Projects', icon: LayoutGrid },
                      { name: 'Groups', icon: Folder },
                      { name: 'Public', icon: Globe },
                      { name: 'Archived', icon: Archive },
                  ].map((item) => (
                      <button
                        key={item.name}
                        onClick={() => { setActiveTab(item.name); setActiveProjectId(null); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            activeTab === item.name && !activeProjectId
                            ? 'bg-slate-800 text-teal-400 shadow-lg shadow-black/20' 
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }`}
                      >
                          <item.icon size={18} />
                          <span>{item.name}</span>
                      </button>
                  ))}
                  
                  {currentUser.role === 'admin' && (
                       <button onClick={() => setShowAdminPanel(true)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-teal-400 mt-4">
                           <Shield size={18} />
                           <span>Admin Panel</span>
                       </button>
                  )}
              </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-slate-950 overflow-hidden relative rounded-tl-2xl shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)] border-t border-l border-slate-800/50 ml-[-1px] mt-[-1px]">
             {activeProjectId ? (
                 // Find the active project from the main state
                 (() => {
                    const proj = projects.find(p => p.id === activeProjectId);
                    return proj ? (
                         <ProjectDetail 
                            project={proj} 
                            onBack={() => setActiveProjectId(null)}
                            onUpdateTaskStatus={handleUpdateTaskStatus}
                            onAddTask={(pid) => setShowNewTask(pid)}
                         />
                    ) : <div>Project not found</div>;
                 })()
             ) : activeTab === 'All Projects' ? (
                 <ProjectTable 
                    projects={projects} 
                    onUpdateStatus={handleUpdateStatus} 
                    onProjectClick={(p) => setActiveProjectId(p.id)}
                    onAddProject={() => setShowNewProject(true)}
                 />
             ) : (
                 <div className="flex flex-col items-center justify-center h-full text-slate-500">
                     <Folder size={48} className="mb-4 opacity-20" />
                     <p className="text-lg font-medium">Content for {activeTab}</p>
                     <p className="text-sm opacity-60">This section is under development.</p>
                 </div>
             )}
          </main>
      </div>

      {/* Chat & Video Integration */}
      <ChatOverlay 
        currentUser={currentUser}
        sessions={chats}
        onSendMessage={handleSendMessage}
        onStartVideoCall={() => setInVideoCall(true)}
      />

      {/* Video Modal */}
      {inVideoCall && (
        <VideoConference 
            onClose={() => setInVideoCall(false)} 
            currentUserAvatar={currentUser.avatar} 
        />
      )}
    </div>
  );
};

export default App;