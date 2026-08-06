import React, { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiCalendar,
  FiCheckCircle,
  FiSearch,
  FiUser,
  FiMessageSquare,
  FiTrendingUp,
  FiEdit3,
  FiPlus,
  FiMinus,
  FiX
} from "react-icons/fi";
import useAxiosHr from "../../URI/useAxiosHr";
import { useAlert } from "../../Common/Alert/useAlert";
import Alert from "../../Common/Alert/Alert";

interface OnboardingNote {
  percent: number;
  note: string;
  strengths?: string;
  weaknesses?: string;
  createdAt?: string;
}

interface OnboardingUser {
  _id: string;
  name: string;
  email: string;
  department?: string;
  manager?: string;
  phone?: string;
  role: "employee" | "hr";
  employmentStatus: "onboarding" | "permanent" | "removed";
  isActive: boolean;
  onboarding: {
    percent: number;
    completedAt?: string | null;
    notes?: OnboardingNote[];
  };
}

interface OnboardingResponse {
  users: OnboardingUser[];
}

const HrOnbording = () => {
  const axiosHr = useAxiosHr();
  const queryClient = useQueryClient();
  const { alert, showAlert, hideAlert } = useAlert();
  
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  
  // পপ-আপ (Modal) স্টেট
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [updateDrafts, setUpdateDrafts] = useState<Record<string, {
    percent: string;
    note: string;
    strengths: string;
    weaknesses: string;
  }>>({});

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching, error, refetch } = useQuery<OnboardingResponse>({
    queryKey: ["hr-onboarding-users", search],
    queryFn: async () => {
      const res = await axiosHr.get("/users/onboarding", {
        params: search ? { search } : undefined,
      });
      return res.data;
    },
  });

  const users = data?.users ?? [];

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      userId: string;
      percent: number;
      note: string;
      strengths: string;
      weaknesses: string;
    }) => {
      const res = await axiosHr.patch(`/users/${payload.userId}/onboarding`, {
        percent: payload.percent,
        note: payload.note,
        strengths: payload.strengths,
        weaknesses: payload.weaknesses,
      });
      return res.data;
    },
    onSuccess: async (_, variables) => {
      showAlert({
        type: "success",
        title: "Progress updated",
        message: "Employee onboarding progress has been saved.",
        duration: 3,
      });
      setUpdateDrafts((current) => {
        const next = { ...current };
        delete next[variables.userId];
        return next;
      });
      setEditingUserId(null); // আপডেট শেষে পপ-আপ বন্ধ
      await queryClient.invalidateQueries({ queryKey: ["hr-onboarding-users"] });
    },
    onError: (err: any) => {
      showAlert({
        type: "error",
        title: "Update failed",
        message: err?.response?.data?.message || "Could not update onboarding progress.",
        duration: 4,
      });
    },
  });

  const stats = useMemo(() => {
    const activeCount = users.length;
    const completedCount = users.filter((user) => user.onboarding.percent >= 100).length;
    const averageProgress = activeCount
      ? Math.round(users.reduce((sum, user) => sum + (user.onboarding.percent || 0), 0) / activeCount)
      : 0;
    return { activeCount, completedCount, averageProgress };
  }, [users]);

  // পপ-আপ খোলার সময় আগের ডাটা সেট করা
  const openModal = (user: OnboardingUser) => {
    setUpdateDrafts(prev => ({
      ...prev,
      [user._id]: {
        percent: user.onboarding.percent.toString() || "0",
        note: "",
        strengths: "",
        weaknesses: ""
      }
    }));
    setEditingUserId(user._id);
  };

  const getDraft = (userId: string) => {
    return updateDrafts[userId] ?? {
      percent: "0",
      note: "",
      strengths: "",
      weaknesses: "",
    };
  };

  const setDraftField = (userId: string, field: "percent" | "note" | "strengths" | "weaknesses", value: string) => {
    setUpdateDrafts((current) => ({
      ...current,
      [userId]: {
        ...getDraft(userId),
        [field]: value,
      },
    }));
  };

  // + এবং - দিয়ে প্রোগ্রেস কন্ট্রোল
  const adjustPercent = (userId: string, amount: number) => {
    const currentPercent = parseInt(getDraft(userId).percent) || 0;
    const newPercent = Math.max(0, Math.min(100, currentPercent + amount));
    setDraftField(userId, "percent", newPercent.toString());
  };

  const handleUpdateSubmit = (userId: string) => {
    const draft = getDraft(userId);
    const percent = Number(draft.percent);

    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      showAlert({
        type: "error",
        title: "Invalid progress",
        message: "Please enter a valid percentage between 0 and 100.",
        duration: 4,
      });
      return;
    }

    if (!draft.note.trim()) {
      showAlert({
        type: "error",
        title: "Note required",
        message: "Every progress update needs a note.",
        duration: 4,
      });
      return;
    }

    updateMutation.mutate({
      userId,
      percent,
      note: draft.note.trim(),
      strengths: draft.strengths.trim(),
      weaknesses: draft.weaknesses.trim(),
    });
  };

  return (
    <div className="pt-5 space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          duration={alert.duration}
          onClose={hideAlert}
        />
      )}

      {/* Header & Stats */}
      <div className="poppins-regular flex flex-col gap-4 rounded-2xl p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            HR ONBOARDING
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#59526F]">
            Employee progress overview
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage new employees until they reach 100% and become permanent.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <StatBubble label="Active" value={stats.activeCount} badgeColor="bg-[#A4CD3C]" />
          <StatBubble label="Completed" value={stats.completedCount} badgeColor="bg-[#59526F]" />
          <StatBubble label="Avg Progress" value={`${stats.averageProgress}%`} badgeColor="bg-[#A4CD3C]" />
        </div>
      </div>

      {/* Main List Section */}
      <div className="poppins-regular  p-6 ">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-800">Current onboarding list</h3>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <div className="relative md:w-80">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search employee, email..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none transition focus:border-gray-400 focus:bg-white"
              />
            </div>
            <button
              onClick={() => refetch()}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-[#59526F] transition hover:bg-gray-50"
            >
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-14 text-center text-sm text-gray-500">Loading onboarding data...</div>
        ) : error ? (
          <div className="py-14 text-center text-sm text-red-500">
            Failed to load onboarding data. Please try again.
          </div>
        ) : users.length === 0 ? (
          <div className="py-14 text-center text-sm text-gray-500">
            No onboarding employees found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {users.map((user) => {
              const notes = user.onboarding.notes ?? [];
              const latestNote = notes[notes.length - 1];
              const percent = Math.max(0, Math.min(100, user.onboarding.percent || 0));
              const isCompleted = percent >= 100;

              return (
                <article
                  key={user._id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md flex flex-col"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-extrabold text-[#59526F]">{user.name}</h4>
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                            <FiCheckCircle size={12} />
                            Permanent
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-600 border border-amber-100">
                            Onboarding
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                        <InfoRow icon={<FiUser />} text={user.email} />
                        <InfoRow icon={<FiCalendar />} text={user.department || "No department"} />
                      </div>
                    </div>

                    <div className="min-w-[180px] rounded-xl bg-gray-50 p-4 border border-gray-100">
                      <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-gray-500">
                        <span>Progress</span>
                        <span className="text-[#59526F]">{percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-[#A4CD3C] transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => openModal(user)}
                          className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-[#59526F] py-2 text-xs font-bold text-white transition hover:bg-[#4A4F63]"
                        >
                          <FiEdit3 size={14} /> Update
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notes Section - Smaller & Truncated */}
                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <MiniCard label="Latest note" value={latestNote?.note || "No notes"} />
                    <MiniCard label="Strengths" value={latestNote?.strengths || "-"} />
                    <MiniCard label="Weaknesses" value={latestNote?.weaknesses || "-"} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Popup Modal (Update Progress) */}
      {editingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#59526F]">Update Progress</h3>
              <button onClick={() => setEditingUserId(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Custom + / - Progress Control */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2 text-center">
                  Set Progress Percentage
                </label>
                <div className="flex items-center justify-center gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <button 
                    onClick={() => adjustPercent(editingUserId, -5)}
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-[#59526F] shadow-sm transition-colors"
                  >
                    <FiMinus size={18} />
                  </button>
                  <div className="w-20 text-center">
                    <span className="text-3xl font-extrabold text-[#59526F]">
                      {getDraft(editingUserId).percent}
                      <span className="text-lg text-gray-400">%</span>
                    </span>
                  </div>
                  <button 
                    onClick={() => adjustPercent(editingUserId, 5)}
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-[#59526F] shadow-sm transition-colors"
                  >
                    <FiPlus size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Note</label>
                <input
                  type="text"
                  value={getDraft(editingUserId).note}
                  onChange={(e) => setDraftField(editingUserId, "note", e.target.value)}
                  placeholder="E.g. Completed week 2 training"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Strengths</label>
                  <textarea
                    rows={2}
                    value={getDraft(editingUserId).strengths}
                    onChange={(e) => setDraftField(editingUserId, "strengths", e.target.value)}
                    placeholder="E.g. Fast learner"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Weaknesses</label>
                  <textarea
                    rows={2}
                    value={getDraft(editingUserId).weaknesses}
                    onChange={(e) => setDraftField(editingUserId, "weaknesses", e.target.value)}
                    placeholder="E.g. Communication"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingUserId(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateSubmit(editingUserId)}
                disabled={updateMutation.isPending}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#59526F] hover:bg-[#4A4F63] disabled:opacity-60 transition-colors"
              >
                {updateMutation.isPending ? "Saving..." : "Save Progress"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Bubble (Ribbon-like design from previous)
const StatBubble = ({ label, value, badgeColor = "bg-[#A4CD3C]" }: { label: string; value: string | number, badgeColor?: string }) => (
  <div className="relative bg-white pt-7 pb-4 px-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
    <div 
      className={`absolute top-0 left-4 ${badgeColor} text-white text-[10px] font-bold px-2 py-0.5`}
      style={{ 
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)', 
        minHeight: '24px', 
        minWidth: '22px', 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'center' 
      }}
    />
    <div className="text-xl font-extrabold text-[#59526F]">{value}</div>
    <div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</div>
  </div>
);

const InfoRow = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2 text-sm text-gray-500">
    <span className="text-[#A4CD3C]">{icon}</span>
    <span className="truncate">{text}</span>
  </div>
);

// MiniCard with truncated text
const MiniCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
    <p 
      className="mt-1 text-xs font-medium text-[#59526F] line-clamp-2" 
      title={value} // Title added so hover shows full text
    >
      {value}
    </p>
  </div>
);

export default HrOnbording;