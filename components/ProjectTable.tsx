import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types';
import { MoreHorizontal, ChevronDown, Filter, Plus, List, LayoutList, Calendar } from 'lucide-react';

interface ProjectTableProps {
  projects: Project[];
  onUpdateStatus: (id: string, newStatus: Project['status']) => void;
  onProjectClick: (project: Project) => void;
  onAddProject: () => void;
}

const STATUS_OPTIONS: Project['status'][] = ['Active', 'In Progress', 'On Track', 'Delayed', 'In Testing'];

const StatusDropdown: React.FC<{ 
    currentStatus: Project['status']; 
    onSelect: (s: Project['status']) => void 
}> = ({ currentStatus, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getColor = (status: Project['status']) => {
        switch (status) {
            case 'Active': return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
            case 'In Progress': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
            case 'On Track': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'Delayed': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            case 'In Testing': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            default: return 'bg-slate-700 text-slate-300';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:brightness-110 ${getColor(currentStatus)}`}
            >
                <span>{currentStatus}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1 space-y-0.5">
                        {STATUS_OPTIONS.map(status => (
                            <button
                                key={status}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(status);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between group hover:bg-slate-800 ${currentStatus === status ? 'text-white bg-slate-800' : 'text-slate-400'}`}
                            >
                                <span>{status}</span>
                                {currentStatus === status && <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const ProjectTable: React.FC<ProjectTableProps> = ({ projects, onUpdateStatus, onProjectClick, onAddProject }) => {
  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Sub Header / Filters */}
      <div className="flex items-center justify-between px-6 py-6">
        <div>
            <h2 className="text-2xl font-bold text-white mb-1">Overview</h2>
            <p className="text-slate-400 text-sm">Manage projects, track progress, and coordinate with your team.</p>
        </div>
        <div className="flex items-center space-x-3">
             <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex">
                <button className="p-2 rounded hover:bg-slate-800 text-white bg-slate-800 shadow-sm"><List size={18} /></button>
                <button className="p-2 rounded hover:bg-slate-800 text-slate-500"><LayoutList size={18} /></button>
             </div>
            <button className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-2 hover:bg-slate-900 rounded-lg transition-colors">
                <Filter size={18} />
                <span className="text-sm font-medium">Filter</span>
            </button>
            <button 
                onClick={onAddProject}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-teal-500/20 flex items-center space-x-2 transition-all transform hover:scale-105"
            >
                <Plus size={18} />
                <span>New Project</span>
            </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <table className="min-w-full text-left">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider w-48">Progress</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider w-32 text-right">Deadline</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider w-10"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
                {projects.map((project) => (
                <tr 
                    key={project.id} 
                    onClick={() => onProjectClick(project)}
                    className="group hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-semibold text-slate-200 text-sm group-hover:text-teal-400 transition-colors">{project.name}</span>
                            <span className="text-xs text-slate-500 font-mono mt-0.5">{project.projectId}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <img src={project.owner.avatar} alt={project.owner.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                            </div>
                            <span className="text-sm text-slate-300">{project.owner.name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <StatusDropdown 
                            currentStatus={project.status} 
                            onSelect={(newStatus) => onUpdateStatus(project.id, newStatus)} 
                        />
                    </td>
                    <td className="px-6 py-4">
                        <div className="w-full">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs font-medium text-slate-400">{project.tasksCompleted}/{project.tasksTotal} Tasks</span>
                                <span className="text-xs font-bold text-slate-200">{project.percent}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        project.status === 'Delayed' ? 'bg-rose-500' :
                                        project.percent === 100 ? 'bg-teal-500' : 
                                        'bg-indigo-500'
                                    }`} 
                                    style={{ width: `${project.percent}%` }}
                                ></div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                         <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${project.status === 'Delayed' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 bg-slate-800'}`}>
                            <Calendar size={12} />
                            <span>{project.endDate || 'No Date'}</span>
                         </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                         <button className="text-slate-600 hover:text-white transition-colors">
                             <MoreHorizontal size={18} />
                         </button>
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