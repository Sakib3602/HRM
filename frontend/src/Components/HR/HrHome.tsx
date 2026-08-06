import { useState, useEffect, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiMenu, 
  FiBell,
  FiGrid, 
  FiUsers, 
  FiCheckSquare, 
  FiFolder, 
  FiMonitor, 
  FiUserPlus, 
  FiFileText, 
  FiCalendar, 
  FiActivity, 
  FiList, 
  FiMessageCircle,
  FiLogOut,
  FiUser
} from 'react-icons/fi';
import { AuthContext } from '../../Common/AUTH/AuthProvider';

const HrHome = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { logOut, user } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const location = useLocation();

  // লাইভ টাইম আপডেটের জন্য useEffect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const menuItems = [
    { id: 'dashboard', icon: <FiGrid size={20} />, label: 'Dashboard', url: '/dashboard/hr' },
    { id: 'quick_task', icon: <FiCheckSquare size={20} />, label: 'Quick Task', url: '/dashboard/hr/quick-task' },
    { id: 'manage_employees', icon: <FiUsers size={20} />, label: 'Manage Employees', url: '/dashboard/hr/manage-employees' },
    { id: 'onboarding', icon: <FiUserPlus size={20} />, label: 'Onboarding', url: '/dashboard/hr/onboarding' },
    { id: 'employee_record', icon: <FiFolder size={20} />, label: 'Employee Record', url: '/dashboard/hr/employee-record' },
    { id: 'interview_portal', icon: <FiMonitor size={20} />, label: 'Interview Portal', url: '/dashboard/hr/interview-portal' },
    { id: 'hr_documents', icon: <FiFileText size={20} />, label: 'HR Documents', url: '/dashboard/hr/hr-documents' },
    { id: 'meeting', icon: <FiCalendar size={20} />, label: 'Meeting & Announcements', url: '/dashboard/hr/meeting' },
    { id: 'office_activity', icon: <FiActivity size={20} />, label: 'Office Activity', url: '/dashboard/hr/office-activity' },
    { id: 'activity_feed', icon: <FiList size={20} />, label: 'Activity Feed', url: '/dashboard/hr/activity-feed' },
    { id: 'team_chat', icon: <FiMessageCircle size={20} />, label: 'Team Chat', url: '/dashboard/hr/team-chat' },
  ];

  return (
    <div className="poppins-regular flex h-screen bg-[#F1F1F1] font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside 
        className={`bg-white border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col z-20 shrink-0 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Top Logo Area */}
        <div className="h-20 flex items-center justify-center border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 cursor-pointer overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-[#E8EBF2] flex items-center justify-center text-[#59526F] shrink-0">
              <FiGrid size={20}/>
            </div>
            <span className={`font-bold text-lg text-[#59526F] transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto ml-2' : 'opacity-0 w-0 overflow-hidden'}`}>
              Genesys HRM
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col items-center gap-2 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <div 
                key={item.id}
                onClick={() => navigate(item.url)}
                className={`flex items-center cursor-pointer transition-all duration-200 ${
                  isSidebarOpen ? 'w-[90%] px-4 py-3 rounded-lg' : 'w-12 h-12 justify-center rounded-xl'
                } ${
                  isActive 
                    ? 'bg-[#F1F1F1] text-[#4A4F63] shadow-sm font-semibold border-r-2 border-[#4A4F63]' 
                    : 'text-[#8A90A5] hover:bg-[#F9FAFC] hover:text-[#4A4F63]'
                }`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <div className="shrink-0">{item.icon}</div>
                
                <span 
                  className={`ml-3 text-sm transition-all duration-300 truncate ${
                    isSidebarOpen ? 'opacity-100 w-full block' : 'opacity-0 w-0 hidden'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Logout Button */}
        <div onClick={() => logOut()} className="p-4 border-t border-gray-100 shrink-0 flex flex-col items-center">
          <button 
            className={`flex items-center w-full cursor-pointer transition-all duration-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 ${
              isSidebarOpen ? 'px-4 py-3 rounded-lg' : 'w-12 h-12 justify-center rounded-xl shadow-sm'
            }`}
            title={!isSidebarOpen ? "Logout" : undefined}
          >
            <div className="shrink-0"><FiLogOut size={20} /></div>
            <span 
              className={`ml-3 text-sm font-medium transition-all duration-300 truncate ${
                isSidebarOpen ? 'opacity-100 w-full block text-left' : 'opacity-0 w-0 hidden'
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Navbar (Updated: No background, no border, added live clock) */}
        <header className="h-20 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
          {/* Left Side: Toggle & Time */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 rounded-lg text-[#8A90A5] hover:bg-gray-200 hover:text-[#4A4F63] transition-colors focus:outline-none"
            >
              <FiMenu size={24} />
            </button>

            <div className="hidden md:flex flex-col ml-2">
              <span className="text-[16px] font-bold text-[#4A4F63]">
                HR Dashboard
              </span>
              <span className="text-[13px] font-medium text-[#8A90A5]">
                {formattedDate} <span className="mx-1">|</span> <span className="text-[#4A4F63]">{formattedTime}</span>
              </span>
            </div>
          </div>

          {/* Right Side: Icons & Profile */}
          <div className="flex items-center gap-6">
            
            <div className="flex items-center gap-4 border-l border-gray-300 pl-6">
              <button className="text-[#8A90A5] hover:text-[#4A4F63] transition-colors">
                <FiMessageCircle size={20}/>
              </button>
              <button className="relative text-[#8A90A5] hover:text-[#4A4F63] transition-colors">
                <FiBell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#F1F1F1]"></span>
              </button>
              <button className="text-[#8A90A5] hover:text-[#4A4F63] transition-colors">
                <FiUser size={20} />
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-full bg-[#E8EBF2] text-[#4A4F63] flex items-center justify-center font-bold shadow-sm cursor-pointer hover:bg-[#dce1ed] transition-colors">
                {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser size={18} />}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto px-8 pb-8 bg-[#F1F1F1]">
          {/* Outlet for dynamic routes */}
          <Outlet />
        </main>
      </div>
      
    </div>
  );
};

export default HrHome;