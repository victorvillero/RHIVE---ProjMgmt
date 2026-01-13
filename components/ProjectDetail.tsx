import React, { useState, useRef, useEffect } from 'react';
import { Project, Task } from '../types';
import { ArrowLeft, Plus, Filter, MoreHorizontal, Calendar, CheckCircle2, Search, X, Flag, AlignLeft, User as UserIcon, Clock } from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdateTaskStatus: (projectId: string, taskId: string, newStatus: Task['status']) => void;
  onAddTask: (projectId: string) => void;
}

const TASK_STATUS_OPTIONS: Task['status'][] = ['Open', 'In Progress', 'On Hold', 'Done'];

const TaskStatusDropdown: React.FC<{ 
    currentStatus: Task['status']; 
    onSelect: (s: Task['status']) => void 
}> = ({ currentStatus, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getColor = (status: Task['status']) => {
        switch (status) {
            case 'Open': return 'bg-slate-700 text-slate-300 border-slate-600';
            case 'In Progress': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
            case 'On Hold': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'Done': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            default: return 'bg-slate-700 text-slate-300';
        }
    };

    return (
        <div className="relative" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`flex items-center justify-center w-28 px-2 py-1.5 rounded text-xs font-semibold border transition-all ${getColor(currentStatus)}`}
            >
                <span>{currentStatus}</span>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    {TASK_STATUS_OPTIONS.map(status => (
                        <button
                            key={status}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(status);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 ${currentStatus === status ? 'text-teal-400' : 'text-slate-300'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Task Details Slide-over Sidebar
const TaskDetailsSidebar: React.FC<{ task: Task; onClose: () => void; onStatusChange: (s: Task['status']) => void }> = ({ task, onClose, onStatusChange }) => {
    const getPriorityColor = (p?: string) => {
        switch(p) {
            case 'High': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'Low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-slate-400 bg-slate-800 border-slate-700';
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 w-[400px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 slide-in-right flex flex-col">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className={task.status === 'Done' ? 'text-emerald-500' : 'text-slate-500'} size={20} />
                    <span className="text-xs font-mono text-slate-500">{task.id}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                    <h2 className="text-xl font-bold text-white mb-2 leading-tight">{task.name}</h2>
                    <div className="flex items-center gap-3 mt-4">
                        <TaskStatusDropdown currentStatus={task.status} onSelect={onStatusChange} />
                        <span className={`px-2.5 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority || 'No Priority'}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-6 mt-0.5 text-slate-500"><AlignLeft size={18} /></div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-slate-300 mb-1">Description</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {task.description || "No description provided for this task."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-6 text-slate-500"><UserIcon size={18} /></div>
                        <div className="flex-1">
                             <h4 className="text-sm font-semibold text-slate-300 mb-1">Assignee</h4>
                             <div className="flex items-center gap-2">
                                <img src={task.assignee.avatar} className="w-6 h-6 rounded-full" alt="" />
                                <span className="text-sm text-slate-400">{task.assignee.name}</span>
                             </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-6 text-slate-500"><Clock size={18} /></div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-300 mb-1">Start Date</h4>
                                <span className="text-sm text-slate-400">{task.startDate || '-'}</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-300 mb-1">Due Date</h4>
                                <span className="text-sm text-slate-400">{task.dueDate || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-900">
                <p className="text-xs text-center text-slate-600">Created by Administrator</p>
            </div>
        </div>
    );
};

// --- Confetti Helper ---
const fireConfetti = (x: number, y: number) => {
    // Simple DOM-based particle explosion
    const count = 30;
    const colors = ['#14b8a6', '#f59e0b', '#6366f1', '#ec4899'];
    
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'fixed w-1.5 h-1.5 rounded-full pointer-events-none z-50';
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        document.body.appendChild(p);
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 4;
        const tx = Math.cos(angle) * velocity * 50;
        const ty = Math.sin(angle) * velocity * 50;
        
        p.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600 + Math.random() * 400,
            easing: 'cubic-bezier(0, .9, .57, 1)',
        }).onfinish = () => p.remove();
    }
};

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onUpdateTaskStatus, onAddTask }) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  // Track recently completed tasks to trigger animation
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

  const filteredTasks = project.tasks?.filter(t => {
      const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.assignee.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
  }) || [];

  const handleStatusUpdate = (taskId: string, newStatus: Task['status'], event?: React.MouseEvent) => {
      onUpdateTaskStatus(project.id, taskId, newStatus);
      
      if (newStatus === 'Done') {
          setJustCompletedId(taskId);
          if (event) fireConfetti(event.clientX, event.clientY);
          // Remove highlight after animation
          setTimeout(() => setJustCompletedId(null), 2000);
      }
      
      // Also update selected task if open
      if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({ ...selectedTask, status: newStatus });
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 animate-in slide-in-from-right-4 duration-300 relative">
      {selectedTask && (
        <TaskDetailsSidebar 
            task={selectedTask} 
            onClose={() => setSelectedTask(null)} 
            onStatusChange={(s) => handleStatusUpdate(selectedTask.id, s)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {project.name}
                    <span className="text-xs font-normal text-slate-500 border border-slate-700 px-2 py-0.5 rounded-full">{project.projectId}</span>
                </h2>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                    <span>{project.tasks?.length || 0} Tasks</span>
                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                    <span>Owner: {project.owner.name}</span>
                </div>
            </div>
        </div>
        
        <div className="flex items-center space-x-3">
             <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 w-64" 
                />
             </div>
             <div className="relative group">
                 <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white">
                     <Filter size={16} />
                     <span>{filterStatus}</span>
                 </button>
                 <div className="absolute top-full right-0 mt-2 w-40 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-20 hidden group-hover:block">
                     {['All', ...TASK_STATUS_OPTIONS].map(s => (
                         <button key={s} onClick={() => setFilterStatus(s)} className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 first:rounded-t-xl last:rounded-b-xl">
                             {s}
                         </button>
                     ))}
                 </div>
             </div>
             <button 
                onClick={() => onAddTask(project.id)}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 transition-colors"
             >
                <Plus size={18} />
                <span>Add Task</span>
            </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
            <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-900/80 text-slate-400 font-medium border-b border-slate-800 sticky top-0 backdrop-blur-md z-10">
                    <tr>
                        <th className="px-6 py-3 w-8"><input type="checkbox" className="rounded bg-slate-800 border-slate-600" /></th>
                        <th className="px-6 py-3">Task Name</th>
                        <th className="px-6 py-3">Priority</th>
                        <th className="px-6 py-3">Owner</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Due Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <tr 
                                key={task.id} 
                                onClick={() => setSelectedTask(task)}
                                className={`group hover:bg-slate-800/40 transition-all cursor-pointer ${justCompletedId === task.id ? 'bg-emerald-900/20' : ''}`}
                            >
                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                    <input type="checkbox" className="rounded bg-slate-800 border-slate-600 accent-teal-500" />
                                </td>
                                <td className="px-6 py-4 relative">
                                    <span className={`text-slate-200 font-medium transition-all duration-500 ${task.status === 'Done' ? 'text-slate-500 line-through decoration-slate-600' : ''}`}>{task.name}</span>
                                    {justCompletedId === task.id && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2">
                                            <CheckCircle2 size={16} className="text-emerald-500 animate-checkmark" />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                         task.priority === 'High' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' :
                                         task.priority === 'Medium' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                                         task.priority === 'Low' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                                         'text-slate-500 border-slate-700'
                                     }`}>
                                         {task.priority || 'Normal'}
                                     </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <img src={task.assignee.avatar} className="w-6 h-6 rounded-full" alt="" />
                                        <span className="text-slate-400">{task.assignee.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                    <div onClick={(e) => {
                                        // Capture click to inject confetti location
                                        if (task.status !== 'Done') {
                                             // We can't easily predict the user selecting 'Done', 
                                             // so we handle it in the parent handler by passing event
                                        }
                                    }}>
                                        <TaskStatusDropdown 
                                            currentStatus={task.status} 
                                            onSelect={(newStatus) => {
                                                // Create a synthetic event or find coordinates
                                                // Simplified: We handle coordinates in the render loop by attaching refs or passing native event from button
                                                // Since dropdown is complex, we just fire confetti center screen or use a simpler trick
                                                // Actually, TaskStatusDropdown captures click. 
                                                // We will rely on simple firing logic in parent.
                                                
                                                // Hack to get mouse position for confetti is hard from here without refactoring Dropdown.
                                                // We will just fire confetti from center of screen or randomly for effect.
                                                const rect = document.body.getBoundingClientRect();
                                                const evt = { clientX: rect.width/2, clientY: rect.height/2 } as any;
                                                handleStatusUpdate(task.id, newStatus, evt);
                                            }} 
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {task.dueDate ? (
                                        <span className={`flex items-center gap-1.5 ${new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-rose-400' : 'text-slate-400'}`}>
                                            <Calendar size={14} />
                                            {task.dueDate}
                                        </span>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                <CheckCircle2 size={48} className="mx-auto mb-3 opacity-20" />
                                <p>No tasks match your filter.</p>
                                <button onClick={() => { setFilterStatus('All'); setSearchQuery(''); }} className="text-teal-400 hover:text-teal-300 text-sm mt-2">Clear filters</button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};