import React, { useContext, useState } from 'react';
import { FiPhoneCall, FiMail, FiMenu, FiX, FiChevronDown, FiArrowRight, FiLogOut, FiUser, FiGrid } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router';
import { AuthContext } from './AUTH/AuthProvider';
import { getDashboardRoute } from './route/roleRoutes';


const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, isAuthenticated, isLoading, logOut } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleGoToDashboard = () => {
    setShowUserMenu(false);
    navigate(getDashboardRoute(user?.role));
  };

  return (
    <header className="w-full font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Top Bar */}
      <div className="bg-[#101826] text-[#B8C0CC] py-2.5 hidden md:block text-sm border-b border-[#2A3850]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-[#E7A33E] text-[#101826] text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">New</span>
            Yearly plans now live — 2 months free
          </div>
          <div className="flex space-x-6">
            <span className="flex items-center gap-2 hover:text-[#E7A33E] transition-colors cursor-pointer">
              <FiPhoneCall size={14} /> +880 1234 567890
            </span>
            <span className="flex items-center gap-2 hover:text-[#E7A33E] transition-colors cursor-pointer">
              <FiMail size={14} /> support@genesys.com
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-[#F3EFE6] border-b border-[#DCD5C4] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="shrink-0 flex items-center gap-2.5 cursor-pointer">
              <div className="w-10 h-10 bg-[#101826] rounded flex items-center justify-center text-[#E7A33E] font-bold text-xl" style={{ fontFamily: 'Fraunces, serif' }}>
                G
              </div>
              <span className="text-xl font-semibold text-[#101826] tracking-tight" style={{ fontFamily: 'Fraunces, serif' }}>
                Genesys <span className="text-[#E7A33E] italic">HRM</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex space-x-9 items-center">
              <div className="relative group">
                <button className="flex items-center gap-1.5 text-[#101826] font-medium hover:text-[#E7A33E] transition-colors py-8">
                  Products <FiChevronDown size={15} />
                </button>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E7A33E] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>
              <a href="#" className="text-[#101826] font-medium hover:text-[#E7A33E] transition-colors">Solutions</a>
              <a href="#" className="text-[#101826] font-medium hover:text-[#E7A33E] transition-colors">Pricing</a>
              <a href="#" className="text-[#101826] font-medium hover:text-[#E7A33E] transition-colors">Resources</a>
            </nav>

            {/* CTA / User area */}
            <div className="hidden lg:flex items-center gap-5">
              {isLoading ? (
                <div className="w-9 h-9 rounded-full bg-[#DCD5C4] animate-pulse" />
              ) : isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-full hover:bg-[#E7E1D3] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#101826] flex items-center justify-center text-[#E7A33E] font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase() ?? <FiUser size={16} />}
                    </div>
                    <span className="text-[#101826] font-medium text-sm">{user?.name}</span>
                    <FiChevronDown size={14} className={`text-[#101826] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-[#DCD5C4] overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#DCD5C4]">
                        <p className="text-[#101826] font-semibold text-sm truncate">{user?.name}</p>
                        <p className="text-[#8A8272] text-xs truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide text-[#E7A33E] bg-[#101826] px-2 py-0.5 rounded-full">
                          {user?.role}
                        </span>
                      </div>

                      <button
                        onClick={handleGoToDashboard}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#101826] hover:bg-[#F3EFE6] transition-colors"
                      >
                        <FiGrid size={15} /> Go to Dashboard
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-[#DCD5C4]"
                      >
                        <FiLogOut size={15} /> Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/get-started">
                  <button className="bg-[#101826] hover:bg-[#E7A33E] hover:text-[#101826] text-[#F3EFE6] px-6 py-2.5 rounded font-semibold transition-colors duration-300 flex items-center gap-2">
                    Start free trial <FiArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button onClick={() => setIsOpen(!isOpen)} className="text-[#101826]">
                {isOpen ? <FiX className="w-7 h-7" /> : <FiMenu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-[#F3EFE6] border-t border-[#DCD5C4] pb-4 shadow-xl absolute w-full left-0">
            <div className="flex flex-col space-y-3 px-6 pt-4">
              <a href="#" className="text-[#101826] font-medium hover:text-[#E7A33E]">Products</a>
              <a href="#" className="text-[#101826] font-medium hover:text-[#E7A33E]">Pricing</a>
              <a href="#" className="text-[#101826] font-medium hover:text-[#E7A33E]">Resources</a>
              <hr className="my-2 border-[#DCD5C4]" />

              {isAuthenticated ? (
                <>
                  <div className="px-2 py-2">
                    <p className="text-[#101826] font-semibold text-sm">{user?.name}</p>
                    <p className="text-[#8A8272] text-xs">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate(getDashboardRoute(user?.role));
                    }}
                    className="flex items-center justify-center gap-2 text-[#101826] font-medium py-2 border border-[#DCD5C4] rounded"
                  >
                    <FiGrid size={15} /> Go to Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 text-red-600 font-medium py-2 border border-red-200 rounded-lg"
                  >
                    <FiLogOut size={15} /> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/get-started" className="text-[#101826] font-medium hover:text-[#E7A33E] text-center py-2 border border-[#DCD5C4] rounded">
                    Log in
                  </Link>
                  <button className="bg-[#101826] text-[#F3EFE6] px-4 py-3 rounded font-semibold w-full mt-2">
                    Start free trial
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;