import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiUserPlus,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useAlert } from "../../Common/Alert/useAlert";
import useAxiosHr from "../../URI/useAxiosHr";
import Alert from "../../Common/Alert/Alert";

interface UserFormValues {
  name: string;
  email: string;
  password: string;
  department: string;
  manager?: string;
  vehicle?: string;
  phone?: string;
}
interface OfficeUser {
  _id: string;
  name: string;
  email: string;
  department: string;
  manager?: string;
  phone?: string;
  role: "employee" | "hr";
  isActive: boolean;
}
interface UsersResponse {
  users: OfficeUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const LIMIT = 10;

const HrManageEmployee: React.FC = () => {
  const axiosHr = useAxiosHr();
  const queryClient = useQueryClient();
  const { alert, showAlert, hideAlert } = useAlert();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "all">("active");
  const [page, setPage] = useState(1);

  // search debounce — টাইপ থামানোর 400ms পর query চলবে
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>();

  const { data, isLoading, isFetching } = useQuery<UsersResponse>({
    queryKey: ["office-users", page, search, status],
    queryFn: async () => {
      const res = await axiosHr.get("/users", {
        params: { page, limit: LIMIT, search, status },
      });
      return res.data;
    },
  });

  const users = data?.users ?? [];
  const pagination = data?.pagination ?? { total: 0, page: 1, limit: LIMIT, totalPages: 1 };

  const createMutation = useMutation({
    mutationFn: async (formData: UserFormValues) => {
      const res = await axiosHr.post("/users", formData);
      return res.data;
    },
    onSuccess: () => {
      showAlert({
        type: "success",
        title: "User added",
        message: "New office user has been created successfully.",
        duration: 3,
      });
      reset();
      queryClient.invalidateQueries({ queryKey: ["office-users"] });
    },
    onError: (err: unknown) => {
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showAlert({
        type: "error",
        title: "Failed to add user",
        message: apiMessage || "Something went wrong.",
        duration: 4,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      await axiosHr.delete(`/users/${id}`);
    },
    onSuccess: () => {
      showAlert({
        type: "success",
        title: "User removed",
        message: "Office user has been removed.",
        duration: 3,
      });
      queryClient.invalidateQueries({ queryKey: ["office-users"] });
    },
    onError: (err: unknown) => {
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showAlert({
        type: "error",
        title: "Failed to remove",
        message: apiMessage || "Something went wrong.",
        duration: 4,
      });
    },
    onSettled: () => setDeletingId(null),
  });

  const onSubmit = (formData: UserFormValues) => {
    createMutation.mutate(formData);
  };

  const totalUsers = pagination.total;
  const employeeCount = users.filter((u) => u.role === "employee").length;
  const hrCount = users.filter((u) => u.role === "hr").length;
  const departmentCount = new Set(users.map((u) => u.department)).size;

  // বার চার্টের জন্য ডেটা এবং কালার কনফিগারেশন (সবুজ থিম অনুযায়ী)
  const chartData = [
    { label: "Total Users", value: totalUsers, color: "bg-[#8FB978]" },
    { label: "Employees", value: employeeCount, color: "bg-[#DDEAC5]" },
    { label: "HR Admins", value: hrCount, color: "bg-[#DDEAC5]" },
    { label: "Departments", value: departmentCount, color: "bg-[#6B7D6B]" },
  ];
  
  // বারের উচ্চতা নির্ণয়ের জন্য সর্বোচ্চ ভ্যালু বের করা
  const maxVal = Math.max(...chartData.map(d => d.value), 1);

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

      {/* Main Page Heading */}
      <div className="poppins-regular">
        <h1 className="text-2xl font-bold text-[#2C3E2F]">Manage Employees</h1>
        <p className="text-sm text-[#6B7D6B] mt-1">Add new members and manage your office users</p>
      </div>

      <div className="poppins-regular grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E4E9E4] p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#2C3E2F] mb-5">
            Add a new office user
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            noValidate
          >
            <div>
              <label className="block text-xs font-semibold text-[#6B7D6B] mb-1.5">
                Full name
              </label>
              <input
                type="text"
                placeholder="e.g. David Miller"
                className="w-full px-3.5 py-2.5 bg-[#F8FBF5] border border-[#E4E9E4] rounded-lg text-sm text-[#2C3E2F] placeholder-[#9CAD9B] focus:outline-none focus:border-[#8FB978] focus:bg-white transition-colors"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7D6B] mb-1.5">
                Work email
              </label>
              <input
                type="email"
                placeholder="david@company.com"
                className="w-full px-3.5 py-2.5 bg-[#F8FBF5] border border-[#E4E9E4] rounded-lg text-sm text-[#2C3E2F] placeholder-[#9CAD9B] focus:outline-none focus:border-[#8FB978] focus:bg-white transition-colors"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#6B7D6B] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Set a login password"
                  className="w-full px-3.5 py-2.5 pr-10 bg-[#F8FBF5] border border-[#E4E9E4] rounded-lg text-sm text-[#2C3E2F] placeholder-[#9CAD9B] focus:outline-none focus:border-[#8FB978] focus:bg-white transition-colors"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CAD9B] hover:text-[#6B7D6B] transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7D6B] mb-1.5">
                Phone number
              </label>
              <input
                type="tel"
                placeholder="e.g. 01712345678"
                className="w-full px-3.5 py-2.5 bg-[#F8FBF5] border border-[#E4E9E4] rounded-lg text-sm text-[#2C3E2F] placeholder-[#9CAD9B] focus:outline-none focus:border-[#8FB978] focus:bg-white transition-colors"
                {...register("phone")}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7D6B] mb-1.5">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Engineering"
                className="w-full px-3.5 py-2.5 bg-[#F8FBF5] border border-[#E4E9E4] rounded-lg text-sm text-[#2C3E2F] placeholder-[#9CAD9B] focus:outline-none focus:border-[#8FB978] focus:bg-white transition-colors"
                {...register("department", { required: "Department is required" })}
              />
              {errors.department && (
                <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7D6B] mb-1.5">
                Reporting manager
              </label>
              <input
                type="text"
                placeholder="e.g. Peter Wilson"
                className="w-full px-3.5 py-2.5 bg-[#F8FBF5] border border-[#E4E9E4] rounded-lg text-sm text-[#2C3E2F] placeholder-[#9CAD9B] focus:outline-none focus:border-[#8FB978] focus:bg-white transition-colors"
                {...register("manager")}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7D6B] mb-1.5">
                Vehicle (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Ford Transit AB12 CDE"
                className="w-full px-3.5 py-2.5 bg-[#F8FBF5] border border-[#E4E9E4] rounded-lg text-sm text-[#2C3E2F] placeholder-[#9CAD9B] focus:outline-none focus:border-[#8FB978] focus:bg-white transition-colors"
                {...register("vehicle")}
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex items-center gap-2 bg-[#8FB978] hover:bg-[#7FA867] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
              >
                <FiUserPlus size={16} />
                {createMutation.isPending ? "Adding..." : "Add user"}
              </button>
            </div>
          </form>
        </div>

        {/* Company Snapshot: Bar Chart Section */}
        <div className="poppins-regular bg-white rounded-2xl border border-[#E4E9E4] p-6 shadow-sm flex flex-col justify-between">
          <h2 className="text-base font-bold text-[#2C3E2F] mb-2">
            Company snapshot
          </h2>
          <p className="text-xs text-[#9CAD9B] mb-6">Visual overview of current page</p>
          
          <div className="flex items-end justify-between gap-3 h-48 border-b-2 border-[#EEF2ED] pb-1 mt-auto">
            {chartData.map((item, index) => {
              // বারের উচ্চতা ক্যালকুলেট করা হচ্ছে, মিনিমাম ১২% রাখা হয়েছে যাতে 0 হলেও ভ্যালু দেখা যায়
              const heightPercent = Math.max((item.value / maxVal) * 100, 15);
              return (
                <div key={index} className="flex flex-col items-center w-full h-full justify-end group">
                  <div 
                    className={`w-10 sm:w-14 ${item.color} rounded-t-md flex items-center justify-center relative transition-all duration-500 hover:opacity-90`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {/* নাম্বারটি বারের একদম মাঝখানে */}
                    <span className="text-white font-bold text-sm absolute top-1/2 -translate-y-1/2">
                      {item.value}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-[#2C3E2F] mt-2 text-center h-8 flex items-center justify-center w-full leading-tight">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="poppins-regular bg-white rounded-2xl border border-[#E4E9E4] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <h2 className="text-base font-bold text-[#2C3E2F]">All office users</h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CAD9B]" size={15} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, email, department..."
                className="pl-9 pr-3 py-2 bg-[#F8FBF5] border border-[#E4E9E4] rounded-lg text-sm text-[#2C3E2F] placeholder-[#9CAD9B] focus:outline-none focus:border-[#8FB978] focus:bg-white transition-colors w-full sm:w-64"
              />
            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as "active" | "inactive" | "all");
                setPage(1);
              }}
              className="px-3 py-2 bg-[#F8FBF5] border border-[#E4E9E4] rounded-lg text-sm text-[#2C3E2F] focus:outline-none focus:border-[#8FB978] focus:bg-white transition-colors"
            >
              <option value="active">Active</option>
              <option value="inactive">Removed</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-[#9CAD9B] text-sm">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="py-10 text-center text-[#9CAD9B] text-sm">No users found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-[#E4E9E4]">
                    <th className="pb-3 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide">Name</th>
                    <th className="pb-3 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide">Email</th>
                    <th className="pb-3 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide">Phone</th>
                    <th className="pb-3 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide">Department</th>
                    <th className="pb-3 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide">Manager</th>
                    <th className="pb-3 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide">Role</th>
                    <th className="pb-3 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide">Status</th>
                    <th className="pb-3 font-semibold text-[#6B7D6B] text-xs uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-[#EEF2ED] last:border-0">
                      <td className="py-3.5 text-[#2C3E2F] font-medium">{u.name}</td>
                      <td className="py-3.5 text-[#6B7D6B]">{u.email}</td>
                      <td className="py-3.5 text-[#6B7D6B]">{u.phone || "—"}</td>
                      <td className="py-3.5 text-[#6B7D6B]">{u.department}</td>
                      <td className="py-3.5 text-[#6B7D6B]">{u.manager || "—"}</td>
                      <td className="py-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.role === "hr" ? "bg-[#E8F2D9] text-[#2C3E2F]" : "bg-[#F3F8EE] text-[#6B7D6B]"
                          }`}
                        >
                          {u.role === "hr" ? "HR Admin" : "Employee"}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.isActive ? "bg-[#E8F2D9] text-[#2C3E2F]" : "bg-red-50 text-red-700"
                          }`}
                        >
                          {u.isActive ? "Active" : "Removed"}
                        </span>
                      </td>
                      <td className="py-3.5">
                        {u.isActive && (
                          <button
                            onClick={() => deleteMutation.mutate(u._id)}
                            disabled={deletingId === u._id}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <FiTrash2 size={13} />
                            {deletingId === u._id ? "Removing..." : "Remove"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#EEF2ED]">
              <p className="text-xs text-[#6B7D6B]">
                Page {pagination.page} of {pagination.totalPages} • {pagination.total} total
                {isFetching && <span className="ml-2 text-[#9CAD9B]">updating...</span>}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1 text-xs font-semibold text-[#6B7D6B] border border-[#E4E9E4] hover:bg-[#F3F8EE] disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors"
                >
                  <FiChevronLeft size={13} /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center gap-1 text-xs font-semibold text-[#6B7D6B] border border-[#E4E9E4] hover:bg-[#F3F8EE] disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors"
                >
                  Next <FiChevronRight size={13} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HrManageEmployee;