import { useState } from 'react';
import { Outlet } from 'react-router-dom';
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
  FiLogOut
} from 'react-icons/fi';

const HrHome = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', icon: <FiGrid size={20} />, label: 'Dashboard' },
    { id: 'quick_task', icon: <FiCheckSquare size={20} />, label: 'Quick Task' },
    { id: 'manage_employees', icon: <FiUsers size={20} />, label: 'Manage Employees' },
    { id: 'employee_record', icon: <FiFolder size={20} />, label: 'Employee Record' },
    { id: 'interview_portal', icon: <FiMonitor size={20} />, label: 'Interview Portal' },
    { id: 'onboarding', icon: <FiUserPlus size={20} />, label: 'Onboarding' },
    { id: 'hr_documents', icon: <FiFileText size={20} />, label: 'HR Documents' },
    { id: 'meeting', icon: <FiCalendar size={20} />, label: 'Meeting & Announcements' },
    { id: 'office_activity', icon: <FiActivity size={20} />, label: 'Office Activity' },
    { id: 'activity_feed', icon: <FiList size={20} />, label: 'Activity Feed' },
    { id: 'team_chat', icon: <FiMessageCircle size={20} />, label: 'Team Chat' },
  ];

  return (
    <div className="poppins-regular flex h-screen bg-[#F0F2F5] font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside 
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col z-20 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Top Logo Area */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 shrink-0">
          <div className="pl-4 poppins-extralight-italic text-gray-600 font-extra-bold cursor-pointer">
            Genesys <span className="font-bold text-blue-600">HRM</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col items-center gap-2 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeMenu === item.id;
            return (
              <div 
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`flex items-center cursor-pointer transition-all duration-200 ${
                  isSidebarOpen ? 'w-[90%] px-4 py-3 rounded-lg' : 'w-12 h-12 justify-center rounded-xl'
                } ${
                  isActive 
                    ? 'bg-slate-700 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <div className="shrink-0">{item.icon}</div>
                
                {/* Text for expanded sidebar */}
                <span 
                  className={`ml-3 text-sm font-medium transition-all duration-300 truncate ${
                    isSidebarOpen ? 'opacity-100 w-full block' : 'opacity-0 w-0 hidden'
                  }`}
                  title={item.label}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 shrink-0 flex flex-col items-center">
          <button 
            className={`flex items-center w-full cursor-pointer transition-all duration-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 ${
              isSidebarOpen ? 'px-4 py-3 rounded-lg' : 'w-12 h-12 justify-center rounded-xl'
            }`}
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
        
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          {/* Left Side: Toggle Button */}
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-slate-800 transition-colors focus:outline-none"
            >
              <FiMenu size={24} />
            </button>
          </div>

          {/* Right Side: Bell Icon & User Profile */}
          <div className="flex items-center gap-6">
            {/* Bell Icon */}
            <button className="relative p-2 text-gray-500 hover:text-slate-800 transition-colors">
              <FiBell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-tight">Sakib Sarkar Emon</p>
                <p className="text-xs text-gray-500 mt-0.5">sakib@genesys.com</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold shadow-sm cursor-pointer hover:bg-slate-800 transition-colors">
                S
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content Outlet */}
        <main className="flex-1 overflow-auto p-6 bg-[#F5F6FA]">
          {/* Ekhan theke react-router-dom er route gulo render hobe */}
          <Outlet />
        </main>
      </div>
      
    </div>
  );
};

export default HrHome;