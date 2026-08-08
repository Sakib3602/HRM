import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FiCalendar,
  FiSpeaker,
  FiUsers,
  FiTrash2,
  FiClock,
  FiInbox,
  FiChevronDown,
} from 'react-icons/fi';
import useAxiosHr from '../../URI/useAxiosHr';
import { useAlert } from '../../Common/Alert/useAlert';
import Alert from '../../Common/Alert/Alert';

interface EmployeeOption {
  _id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

interface AnnouncementFormValues {
  title: string;
  description: string;
}

interface MeetingFormValues {
  title: string;
  description: string;
  date: string;
  time: string;
  employeeId: string[];
}

interface Announcement {
  _id: string;
  title: string;
  description: string;
  createdBy: { name: string };
  createdAt: string;
}

interface Meeting {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  employeeId: { _id: string; name: string; department: string }[];
  createdBy: { name: string };
}

const getInitials = (name?: string) =>
  name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

const avatarPalette = ['bg-[#8FB978]', 'bg-[#7FA867]', 'bg-[#DDEAC5]', 'bg-[#6B7D6B]', 'bg-[#D7C58A]', 'bg-[#A8B88B]'];
const getAvatarColor = (name?: string) => avatarPalette[(name?.charCodeAt(0) ?? 0) % avatarPalette.length];

const isMeetingPast = (m: Meeting) => new Date(`${m.date}T${m.time}`).getTime() < Date.now();

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const formatTime12h = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
};

const HrMeeting: React.FC = () => {
  const axiosHr = useAxiosHr();
  const queryClient = useQueryClient();
  const { alert, showAlert, hideAlert } = useAlert();
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<string | null>(null);
  const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(null);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);

  const { data: employees = [] } = useQuery<EmployeeOption[]>({
    queryKey: ['all-users-dropdown'],
    queryFn: async () => {
      const res = await axiosHr.get('/users/allUsers');
      return res.data.users;
    },
  });

  // ---------- Announcement ----------
  const {
    register: registerAnnouncement,
    handleSubmit: handleSubmitAnnouncement,
    reset: resetAnnouncement,
    formState: { errors: announcementErrors },
  } = useForm<AnnouncementFormValues>();

  const { data: announcements = [], isLoading: loadingAnnouncements } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await axiosHr.get('/announcements');
      return res.data;
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: AnnouncementFormValues) => {
      const res = await axiosHr.post('/announcements', data);
      return res.data;
    },
    onSuccess: () => {
      showAlert({ type: 'success', title: 'Announcement posted', message: 'Your announcement is now live.', duration: 3 });
      resetAnnouncement();
      setShowAnnouncementForm(false);
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (err: any) => {
      showAlert({
        type: 'error',
        title: 'Failed to post',
        message: err?.response?.data?.message || 'Something went wrong.',
        duration: 4,
      });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingAnnouncementId(id);
      await axiosHr.delete(`/announcements/${id}`);
    },
    onSuccess: () => {
      showAlert({ type: 'success', title: 'Removed', message: 'Announcement deleted.', duration: 2 });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onSettled: () => setDeletingAnnouncementId(null),
  });

  // ---------- Meeting ----------
  const {
    register: registerMeeting,
    handleSubmit: handleSubmitMeeting,
    reset: resetMeeting,
    control,
    formState: { errors: meetingErrors },
  } = useForm<MeetingFormValues>({ defaultValues: { employeeId: [] } });

  const { data: meetings = [], isLoading: loadingMeetings } = useQuery<Meeting[]>({
    queryKey: ['meetings'],
    queryFn: async () => {
      const res = await axiosHr.get('/meetings');
      return res.data;
    },
  });

  const sortedMeetings = useMemo(
    () => [...meetings].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()),
    [meetings]
  );

  const createMeetingMutation = useMutation({
    mutationFn: async (data: MeetingFormValues) => {
      const res = await axiosHr.post('/meetings', data);
      return res.data;
    },
    onSuccess: () => {
      showAlert({ type: 'success', title: 'Meeting scheduled', message: 'Invited employees have been notified.', duration: 3 });
      resetMeeting();
      setShowMeetingForm(false);
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (err: any) => {
      showAlert({
        type: 'error',
        title: 'Failed to schedule',
        message: err?.response?.data?.message || 'Something went wrong.',
        duration: 4,
      });
    },
  });

  const deleteMeetingMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingMeetingId(id);
      await axiosHr.delete(`/meetings/${id}`);
    },
    onSuccess: () => {
      showAlert({ type: 'success', title: 'Removed', message: 'Meeting cancelled.', duration: 2 });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onSettled: () => setDeletingMeetingId(null),
  });

  return (
    <div className="mt-5 poppins-regular space-y-6">
      {alert && (
        <Alert type={alert.type} title={alert.title} message={alert.message} duration={alert.duration} onClose={hideAlert} />
      )}

      <div>
        <h1 className="text-xl font-bold text-[#2C3E2F]">Meetings & Announcements</h1>
        <p className="text-sm text-[#6B7D6B] mt-1">Schedule meetings and post company-wide announcements.</p>
      </div>

      {/* ================= ANNOUNCEMENTS ================= */}
      <div className="bg-white rounded-2xl border border-[#E4E9E4] shadow-sm overflow-hidden">
        <button
          onClick={() => setShowAnnouncementForm((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-5 hover:bg-[#F3F8EE] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E8F2D9] flex items-center justify-center text-[#8FB978]">
              <FiSpeaker size={16} />
            </div>
            <div className="text-left">
              <h2 className="text-base font-bold text-[#2C3E2F]">Announcements</h2>
              <p className="text-xs text-[#9CAD9B]">{announcements.length} posted</p>
            </div>
          </div>
          <FiChevronDown size={18} className={`text-[#9CAD9B] transition-transform ${showAnnouncementForm ? 'rotate-180' : ''}`} />
        </button>

        {showAnnouncementForm && (
          <div className="px-6 pb-6 border-t border-[#EEF2ED] pt-5">
            <form onSubmit={handleSubmitAnnouncement((data) => createAnnouncementMutation.mutate(data))} className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-[#6B7D6B] mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Office closed on Friday"
                  className="w-full px-3.5 py-2.5 bg-[#F8FBF5] border border-[#E4E9E4] rounded-lg text-sm text-[#2C3E2F] placeholder-[#9CAD9B] focus:outline-none focus:border-[#8FB978] focus:ring-2 focus:ring-[#DDEAC5] focus:bg-white transition-all"
                  {...registerAnnouncement('title', { required: 'Title is required' })}
                />
                {announcementErrors.title && <p className="text-red-500 text-xs mt-1">{announcementErrors.title.message}</p>}
              </div>
              <div className="sm:row-span-2">
                <label className="block text-xs font-semibold text-[#6B7D6B] mb-1.5">Description</label>
                <textarea
                  rows={4}
                  placeholder="Announcement details..."
                  className="w-full px-3.5 py-2.5 bg-[#F8FBF5] border border-[#E4E9E4] rounded-lg text-sm text-[#2C3E2F] placeholder-[#9CAD9B] focus:outline-none focus:border-[#8FB978] focus:ring-2 focus:ring-[#DDEAC5] focus:bg-white transition-all resize-none"
                  {...registerAnnouncement('description', { required: 'Description is required' })}
                />
                {announcementErrors.description && (
                  <p className="text-red-500 text-xs mt-1">{announcementErrors.description.message}</p>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={createAnnouncementMutation.isPending}
                  className="flex items-center gap-2 bg-[#8FB978] hover:bg-[#7FA867] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  <FiSpeaker size={15} />
                  {createAnnouncementMutation.isPending ? 'Posting...' : 'Post announcement'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcements Table */}
        {loadingAnnouncements ? (
          <div className="py-14 flex flex-col items-center gap-2 text-[#9CAD9B] border-t border-[#EEF2ED]">
            <div className="w-6 h-6 border-2 border-[#DDEAC5] border-t-[#8FB978] rounded-full animate-spin" />
            <p className="text-sm">Loading...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-14 flex flex-col items-center gap-2 text-[#9CAD9B] border-t border-[#EEF2ED]">
            <FiInbox size={24} />
            <p className="text-sm">No announcements posted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-[#EEF2ED]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left bg-[#F8FBF5] border-b border-[#E4E9E4]">
                  <th className="py-3 px-6 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide">Title</th>
                  <th className="py-3 px-4 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide">Posted By</th>
                  <th className="py-3 px-4 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide">Date</th>
                  <th className="py-3 px-6 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((a) => (
                  <tr key={a._id} className="border-b border-[#EEF2ED] last:border-0 hover:bg-[#F3F8EE] transition-colors">
                    <td className="py-4 px-6 align-top">
                      <p className="font-semibold text-[#2C3E2F]">{a.title}</p>
                      <p className="text-xs text-[#6B7D6B] mt-1 max-w-md">{a.description}</p>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${getAvatarColor(a.createdBy?.name)}`}>
                          {getInitials(a.createdBy?.name)}
                        </div>
                        <span className="text-[#2C3E2F]">{a.createdBy?.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top text-[#6B7D6B]">{formatDate(a.createdAt)}</td>
                    <td className="py-4 px-6 align-top text-right">
                      <button
                        onClick={() => deleteAnnouncementMutation.mutate(a._id)}
                        disabled={deletingAnnouncementId === a._id}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7D6B] hover:text-red-600 border border-[#E4E9E4] hover:border-red-200 hover:bg-red-50 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={13} />
                        {deletingAnnouncementId === a._id ? 'Removing...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MEETINGS ================= */}
      <div className="bg-white rounded-2xl border border-[#E4E9E4] shadow-sm overflow-hidden">
        <button
          onClick={() => setShowMeetingForm((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-5 hover:bg-[#F3F8EE] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E8F2D9] flex items-center justify-center text-[#8FB978]">
              <FiCalendar size={16} />
            </div>
            <div className="text-left">
              <h2 className="text-base font-bold text-[#2C3E2F]">Meetings</h2>
              <p className="text-xs text-[#9CAD9B]">{meetings.length} scheduled</p>
            </div>
          </div>
          <FiChevronDown size={18} className={`text-[#9CAD9B] transition-transform ${showMeetingForm ? 'rotate-180' : ''}`} />
        </button>

        {showMeetingForm && (
          <div className="px-6 pb-6 border-t border-[#EEF2ED] pt-5">
            <form onSubmit={handleSubmitMeeting((data) => createMeetingMutation.mutate(data))} className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-[#6B7D6B] mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Sprint planning"
                  className="w-full px-3.5 py-2.5 bg-[#F8FBF5] border border-[#E4E9E4] rounded-lg text-sm text-[#2C3E2F] placeholder-[#9CAD9B] focus:outline-none focus:border-[#8FB978] focus:ring-2 focus:ring-[#DDEAC5] focus:bg-white transition-all"
                  {...registerMeeting('title', { required: 'Title is required' })}
                />
                {meetingErrors.title && <p className="text-red-500 text-xs mt-1">{meetingErrors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7D6B] mb-1.5">Date</label>
                  <input
                    type="date"
                    className="w-full px-3.5 py-2.5 bg-[#F8FBF5] border border-[#E4E9E4] rounded-lg text-sm text-[#2C3E2F] focus:outline-none focus:border-[#8FB978] focus:ring-2 focus:ring-[#DDEAC5] focus:bg-white transition-all"
                    {...registerMeeting('date', { required: 'Date is required' })}
                  />
                  {meetingErrors.date && <p className="text-red-500 text-xs mt-1">{meetingErrors.date.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7D6B] mb-1.5">Time</label>
                  <input
                    type="time"
                    className="w-full px-3.5 py-2.5 bg-[#F8FBF5] border border-[#E4E9E4] rounded-lg text-sm text-[#2C3E2F] focus:outline-none focus:border-[#8FB978] focus:ring-2 focus:ring-[#DDEAC5] focus:bg-white transition-all"
                    {...registerMeeting('time', { required: 'Time is required' })}
                  />
                  {meetingErrors.time && <p className="text-red-500 text-xs mt-1">{meetingErrors.time.message}</p>}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#6B7D6B] mb-1.5">Description</label>
                <textarea
                  rows={2}
                  placeholder="Agenda..."
                  className="w-full px-3.5 py-2.5 bg-[#F8FBF5] border border-[#E4E9E4] rounded-lg text-sm text-[#2C3E2F] placeholder-[#9CAD9B] focus:outline-none focus:border-[#8FB978] focus:ring-2 focus:ring-[#DDEAC5] focus:bg-white transition-all resize-none"
                  {...registerMeeting('description', { required: 'Description is required' })}
                />
                {meetingErrors.description && <p className="text-red-500 text-xs mt-1">{meetingErrors.description.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#6B7D6B] mb-1.5 flex items-center gap-1.5">
                  <FiUsers size={13} /> Invite employees
                </label>
                <Controller
                  name="employeeId"
                  control={control}
                  rules={{ validate: (v) => v.length > 0 || 'Select at least one employee' }}
                  render={({ field }) => (
                    <div className="border border-[#E4E9E4] rounded-lg max-h-40 overflow-y-auto p-2 bg-[#F8FBF5]">
                      {employees.length === 0 ? (
                        <p className="text-xs text-[#9CAD9B] p-2">No employees found.</p>
                      ) : (
                        employees.map((emp) => {
                          const checked = field.value.includes(emp._id);
                          return (
                            <label
                              key={emp._id}
                              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer text-sm transition-colors ${
                                checked ? 'bg-[#E8F2D9]' : 'hover:bg-white'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) field.onChange([...field.value, emp._id]);
                                  else field.onChange(field.value.filter((id) => id !== emp._id));
                                }}
                                className="w-4 h-4 rounded border-[#DCE3DA] text-[#8FB978] focus:ring-[#8FB978]"
                              />
                              <span className="text-[#2C3E2F]">{emp.name}</span>
                              <span className="text-[#9CAD9B] text-xs">— {emp.department}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}
                />
                {meetingErrors.employeeId && <p className="text-red-500 text-xs mt-1">{meetingErrors.employeeId.message}</p>}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={createMeetingMutation.isPending}
                  className="flex items-center gap-2 bg-[#8FB978] hover:bg-[#7FA867] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  <FiCalendar size={15} />
                  {createMeetingMutation.isPending ? 'Scheduling...' : 'Schedule meeting'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Meetings Table */}
        {loadingMeetings ? (
          <div className="py-14 flex flex-col items-center gap-2 text-[#9CAD9B] border-t border-[#EEF2ED]">
            <div className="w-6 h-6 border-2 border-[#DDEAC5] border-t-[#8FB978] rounded-full animate-spin" />
            <p className="text-sm">Loading...</p>
          </div>
        ) : sortedMeetings.length === 0 ? (
          <div className="py-14 flex flex-col items-center gap-2 text-[#9CAD9B] border-t border-[#EEF2ED]">
            <FiInbox size={24} />
            <p className="text-sm">No meetings scheduled yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-[#EEF2ED]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left bg-[#F8FBF5] border-b border-[#E4E9E4]">
                  <th className="py-3 px-6 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide">Meeting</th>
                  <th className="py-3 px-4 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide">Date & Time</th>
                  <th className="py-3 px-4 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide">Attendees</th>
                  <th className="py-3 px-4 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide">Status</th>
                  <th className="py-3 px-6 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedMeetings.map((m) => {
                  const past = isMeetingPast(m);
                  return (
                    <tr key={m._id} className="border-b border-[#EEF2ED] last:border-0 hover:bg-[#F3F8EE] transition-colors">
                      <td className="py-4 px-6 align-top">
                        <p className="font-semibold text-[#2C3E2F]">{m.title}</p>
                        <p className="text-xs text-[#6B7D6B] mt-1 max-w-xs line-clamp-1">{m.description}</p>
                        <p className="text-[11px] text-[#9CAD9B] mt-1">By {m.createdBy?.name}</p>
                      </td>

                      <td className="py-4 px-4 align-top">
                        <p className="font-medium text-[#2C3E2F] flex items-center gap-1.5">
                          <FiCalendar size={12} className="text-[#9CAD9B]" /> {formatDate(m.date)}
                        </p>
                        <p className="text-xs text-[#6B7D6B] mt-0.5 flex items-center gap-1.5">
                          <FiClock size={12} className="text-[#9CAD9B]" /> {formatTime12h(m.time)}
                        </p>
                      </td>

                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center -space-x-2">
                          {m.employeeId?.slice(0, 4).map((emp) => (
                            <div
                              key={emp._id}
                              title={`${emp.name} — ${emp.department}`}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white ${getAvatarColor(emp.name)}`}
                            >
                              {getInitials(emp.name)}
                            </div>
                          ))}
                          {m.employeeId?.length > 4 && (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#E4E9E4] text-[#6B7D6B] text-[10px] font-bold border-2 border-white">
                              +{m.employeeId.length - 4}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            past ? 'bg-[#F3F8EE] text-[#6B7D6B]' : 'bg-[#E8F2D9] text-[#2C3E2F]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${past ? 'bg-[#9CAD9B]' : 'bg-[#8FB978]'}`} />
                          {past ? 'Completed' : 'Upcoming'}
                        </span>
                      </td>

                      <td className="py-4 px-6 align-top text-right">
                        <button
                          onClick={() => deleteMeetingMutation.mutate(m._id)}
                          disabled={deletingMeetingId === m._id}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7D6B] hover:text-red-600 border border-[#E4E9E4] hover:border-red-200 hover:bg-red-50 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={13} />
                          {deletingMeetingId === m._id ? 'Removing...' : 'Cancel'}
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

export default HrMeeting;