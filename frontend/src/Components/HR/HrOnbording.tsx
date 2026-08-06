

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    FiCalendar,
    FiCheckCircle,
    FiChevronDown,
    FiChevronUp,
    FiSearch,
    FiUser,
    FiMessageSquare,
    FiTrendingUp,
    FiEdit3,
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
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
    const [updateDrafts, setUpdateDrafts] = useState<Record<string, {
        percent: string;
        note: string;
        strengths: string;
        weaknesses: string;
    }>>({});

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
            setExpandedUserId(null);
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

    const getDraft = (userId: string) => {
        return updateDrafts[userId] ?? {
            percent: "",
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
        <div className="space-y-6">
            {alert && (
                <Alert
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    duration={alert.duration}
                    onClose={hideAlert}
                />
            )}

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        HR onboarding
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        Employee progress overview
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        New employees are shown here until they reach 100% and become permanent.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <StatBubble label="Active" value={stats.activeCount} />
                    <StatBubble label="Completed" value={stats.completedCount} />
                    <StatBubble label="Avg %" value={`${stats.averageProgress}%`} />
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900">Current onboarding list</h3>
                        <p className="text-sm text-slate-500">
                            Permanent employees disappear from this page automatically.
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                        <div className="relative md:w-80">
                            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search employee, email, department"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                            />
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            {isFetching ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-14 text-center text-sm text-slate-500">Loading onboarding data...</div>
                ) : error ? (
                    <div className="py-14 text-center text-sm text-red-500">
                        Failed to load onboarding data. Please try again.
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-14 text-center text-sm text-slate-500">
                        No onboarding employees found.
                    </div>
                ) : (
                    <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {users.map((user) => {
                            const notes = user.onboarding.notes ?? [];
                            const latestNote = notes[notes.length - 1];
                            const percent = Math.max(0, Math.min(100, user.onboarding.percent || 0));
                            const isCompleted = percent >= 100;

                            return (
                                <article
                                    key={user._id}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-lg font-bold text-slate-900">{user.name}</h4>
                                                {isCompleted ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                        <FiCheckCircle size={14} />
                                                        Permanent employee
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                        Onboarding
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                                <InfoRow icon={<FiUser size={14} />} text={user.email} />
                                                <InfoRow icon={<FiTrendingUp size={14} />} text={`${percent}% complete`} />
                                                <InfoRow icon={<FiCalendar size={14} />} text={user.department || "No department"} />
                                                <InfoRow icon={<FiMessageSquare size={14} />} text={user.manager || "No manager set"} />
                                            </div>
                                        </div>

                                        <div className="min-w-[220px] rounded-2xl bg-white p-4 shadow-sm">
                                            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                <span>Progress</span>
                                                <span>{percent}%</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-200">
                                                <div
                                                    className="h-2 rounded-full bg-slate-900 transition-all"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <p className="mt-3 text-sm text-slate-500">
                                                {isCompleted
                                                    ? "This employee is now marked as permanent and hidden from onboarding lists."
                                                    : "Progress updates will be logged with a note, strengths, and weaknesses."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                                        <MiniCard label="Latest note" value={latestNote?.note || "No notes yet"} />
                                        <MiniCard label="Strengths" value={latestNote?.strengths || "-"} />
                                        <MiniCard label="Weaknesses" value={latestNote?.weaknesses || "-"} />
                                    </div>

                                    {!isCompleted && (
                                        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedUserId((current) => (current === user._id ? null : user._id))}
                                                className="flex w-full items-center justify-between text-left"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FiEdit3 className="text-slate-500" size={16} />
                                                    <span className="text-sm font-semibold text-slate-800">Update progress</span>
                                                </div>
                                                {expandedUserId === user._id ? (
                                                    <FiChevronUp className="text-slate-500" size={16} />
                                                ) : (
                                                    <FiChevronDown className="text-slate-500" size={16} />
                                                )}
                                            </button>

                                            {expandedUserId === user._id && (
                                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Progress percent
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            value={getDraft(user._id).percent}
                                                            onChange={(e) => setDraftField(user._id, "percent", e.target.value)}
                                                            placeholder={`Current: ${percent}`}
                                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Note
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={getDraft(user._id).note}
                                                            onChange={(e) => setDraftField(user._id, "note", e.target.value)}
                                                            placeholder="Example: Better communication in team syncs"
                                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Strengths
                                                        </label>
                                                        <textarea
                                                            rows={3}
                                                            value={getDraft(user._id).strengths}
                                                            onChange={(e) => setDraftField(user._id, "strengths", e.target.value)}
                                                            placeholder="Example: Fast learner, proactive"
                                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Weaknesses
                                                        </label>
                                                        <textarea
                                                            rows={3}
                                                            value={getDraft(user._id).weaknesses}
                                                            onChange={(e) => setDraftField(user._id, "weaknesses", e.target.value)}
                                                            placeholder="Example: Needs more confidence in client calls"
                                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2 flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateSubmit(user._id)}
                                                            disabled={updateMutation.isPending}
                                                            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {updateMutation.isPending ? "Saving..." : "Save update"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpandedUserId(null)}
                                                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {latestNote?.createdAt && (
                                        <p className="mt-4 text-xs text-slate-400">
                                            Last updated: {new Date(latestNote.createdAt).toLocaleString()}
                                        </p>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const StatBubble = ({ label, value }: { label: string; value: string | number }) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="text-xl font-bold text-slate-900">{value}</div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
    </div>
);

const InfoRow = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
        <span className="text-slate-400">{icon}</span>
        <span className="truncate">{text}</span>
    </div>
);

const MiniCard = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-sm text-slate-700 line-clamp-3">{value}</p>
    </div>
);

export default HrOnbording;