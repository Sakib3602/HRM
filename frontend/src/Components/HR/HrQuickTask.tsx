import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FiClipboard,
  FiTrash2,
  FiClock,
  FiCheckCircle,
  FiLoader,
  FiAlertTriangle,
  FiInbox,
} from 'react-icons/fi';
import useAxiosHr from '../../URI/useAxiosHr';
import { useAlert } from '../../Common/Alert/useAlert';
import Alert from '../../Common/Alert/Alert';

interface TaskFormValues {
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
}

interface EmployeeOption {
  _id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  completionNote?: string;
  assignedTo: { _id: string; name: string; email: string; department: string };
  createdBy: { _id: string; name: string };
  createdAt: string;
}

type EffectiveStatus = Task['status'] | 'overdue';

const statusConfig: Record<
  EffectiveStatus,
  { label: string; bg: string; text: string; dot: string; icon: React.ReactNode }
> = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', icon: <FiClock size={12} /> },
  'in-progress': { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', icon: <FiLoader size={12} /> },
  completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: <FiCheckCircle size={12} /> },
  overdue: { label: 'Overdue', bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-600', icon: <FiAlertTriangle size={12} /> },
};

const isTaskOverdue = (task: Task): boolean => {
  if (task.status === 'completed') return false;
  return new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
};

const getEffectiveStatus = (task: Task): EffectiveStatus => (isTaskOverdue(task) ? 'overdue' : task.status);

const getInitials = (name?: string) =>
  name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

const avatarPalette = ['bg-slate-700', 'bg-indigo-600', 'bg-teal-600', 'bg-amber-600', 'bg-violet-600', 'bg-cyan-600'];
const getAvatarColor = (name?: string) => {
  const idx = (name?.charCodeAt(0) ?? 0) % avatarPalette.length;
  return avatarPalette[idx];
};

const formatDueDate = (dateStr: string) => {
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (diffDays === 0) return { formatted, relative: 'Due today' };
  if (diffDays === 1) return { formatted, relative: 'Due tomorrow' };
  if (diffDays > 1) return { formatted, relative: `In ${diffDays} days` };
  return { formatted, relative: `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} overdue` };
};

const HrQuickTask: React.FC = () => {
  const axiosHr = useAxiosHr();
  const queryClient = useQueryClient();
  const { alert, showAlert, hideAlert } = useAlert();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>();

  const { data: employees = [] } = useQuery<EmployeeOption[]>({
    queryKey: ['all-users-dropdown'],
    queryFn: async () => {
      const res = await axiosHr.get('/users/allUsers');
      return res.data.users;
    },
  });

  const assignableEmployees = useMemo(
    () => employees.filter((employee) => employee.role === 'employee'),
    [employees]
  );

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await axiosHr.get('/tasks');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const res = await axiosHr.post('/tasks', data);
      return res.data;
    },
    onSuccess: () => {
      showAlert({ type: 'success', title: 'Task assigned', message: 'The task has been assigned successfully.', duration: 3 });
      reset();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err: any) => {
      showAlert({
        type: 'error',
        title: 'Failed to assign',
        message: err?.response?.data?.message || 'Something went wrong.',
        duration: 4,
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await axiosHr.patch(`/tasks/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      await axiosHr.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      showAlert({ type: 'success', title: 'Task removed', message: 'The task has been deleted.', duration: 3 });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onSettled: () => setDeletingId(null),
  });

  const onSubmit = (data: TaskFormValues) => {
    createMutation.mutate(data);
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aOverdue = isTaskOverdue(a);
      const bOverdue = isTaskOverdue(b);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') return sortedTasks;
    return sortedTasks.filter((task) => task.status === statusFilter);
  }, [sortedTasks, statusFilter]);

  const filterCounts = useMemo(
    () => ({
      all: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    }),
    [tasks]
  );

  const overdueCount = tasks.filter(isTaskOverdue).length;

  return (
    <div className="poppins-regular space-y-6">
      {alert && (
        <Alert type={alert.type} title={alert.title} message={alert.message} duration={alert.duration} onClose={hideAlert} />
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Quick Task</h1>
          <p className="text-sm text-gray-500 mt-1">Assign tasks to your team and track their progress.</p>
        </div>
      </div>

      {/* Assign Task Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <FiClipboard size={16} />
          </div>
          <h2 className="text-base font-bold text-gray-800">Assign a new task</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Task title</label>
            <input
              type="text"
              placeholder="e.g. Prepare Q3 attendance report"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Task details..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all resize-none"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Assign to</label>
            <select
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all"
              {...register('assignedTo', { required: 'Please select an employee' })}
            >
              <option value="">Select employee</option>
              {assignableEmployees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} — {emp.department}
                </option>
              ))}
            </select>
            {assignableEmployees.length === 0 && (
              <p className="text-amber-600 text-xs mt-1">No active employees available to assign tasks.</p>
            )}
            {errors.assignedTo && <p className="text-red-500 text-xs mt-1">{errors.assignedTo.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Due date</label>
            <input
              type="date"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all"
              {...register('dueDate', { required: 'Due date is required' })}
            />
            {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>}
          </div>

          <div className="sm:col-span-2 pt-1">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
            >
              <FiClipboard size={16} />
              {createMutation.isPending ? 'Assigning...' : 'Assign task'}
            </button>
          </div>
        </form>
      </div>

      {/* Task List Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">All tasks</h2>
            {overdueCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full">
                <FiAlertTriangle size={12} />
                {overdueCount} overdue
              </span>
            )}
          </div>

          {/* Filter toggle */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'in-progress', 'completed'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  statusFilter === key
                    ? 'bg-slate-700 border-slate-700 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-slate-300 hover:bg-gray-50'
                }`}
              >
                {key === 'all' ? 'All' : key === 'in-progress' ? 'In Progress' : key.charAt(0).toUpperCase() + key.slice(1)}
                <span className={`ml-1.5 ${statusFilter === key ? 'text-white/70' : 'text-gray-400'}`}>
                  {filterCounts[key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            <p className="text-sm">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
            <FiInbox size={28} />
            <p className="text-sm">No tasks found for this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wide">Task</th>
                  <th className="py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Assigned To</th>
                  <th className="py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Due Date</th>
                  <th className="py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="py-3 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wide text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const effectiveStatus = getEffectiveStatus(task);
                  const cfg = statusConfig[effectiveStatus];
                  const overdue = effectiveStatus === 'overdue';
                  const dueInfo = formatDueDate(task.dueDate);

                  return (
                    <tr
                      key={task._id}
                      className={`border-b border-gray-100 last:border-0 transition-colors ${
                        overdue ? 'bg-rose-50/70 hover:bg-rose-50' : 'hover:bg-gray-50/70'
                      }`}
                    >
                      <td className="py-4 px-6 align-top">
                        <div className="flex items-start gap-2.5">
                          {overdue && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />}
                          <div>
                            <p className={`font-semibold ${overdue ? 'text-rose-900' : 'text-gray-800'}`}>{task.title}</p>
                            <p className="text-gray-500 text-xs mt-0.5 max-w-xs line-clamp-1">{task.description}</p>
                            {task.status === 'completed' && task.completionNote && (
                              <p className="text-emerald-700 text-xs mt-1.5 bg-emerald-50 border border-emerald-100 rounded px-2 py-1 max-w-xs">
                                <span className="font-semibold">Note: </span>
                                {task.completionNote}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${getAvatarColor(
                              task.assignedTo?.name
                            )}`}
                          >
                            {getInitials(task.assignedTo?.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{task.assignedTo?.name}</p>
                            <p className="text-xs text-gray-500">{task.assignedTo?.department}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 align-top">
                        <p className={`font-medium ${overdue ? 'text-rose-700' : 'text-gray-700'}`}>{dueInfo.formatted}</p>
                        <p className={`text-xs mt-0.5 ${overdue ? 'text-rose-500 font-medium' : 'text-gray-400'}`}>
                          {dueInfo.relative}
                        </p>
                      </td>

                      <td className="py-4 px-4 align-top">
                        <div className="relative inline-block">
                          <select
                            value={task.status}
                            onChange={(e) => statusMutation.mutate({ id: task._id, status: e.target.value })}
                            className={`appearance-none pl-6 pr-7 py-1.5 rounded-full text-xs font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer ${cfg.bg} ${cfg.text}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        </div>
                        {overdue && (
                          <p className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 mt-1.5">
                            <FiAlertTriangle size={10} /> Overdue
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-6 align-top text-right">
                        <button
                          onClick={() => deleteMutation.mutate(task._id)}
                          disabled={deletingId === task._id}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={13} />
                          {deletingId === task._id ? 'Removing...' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HrQuickTask;