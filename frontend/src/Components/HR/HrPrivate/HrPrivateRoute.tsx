import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router';
import { AuthContext } from '../../../Common/AUTH/AuthProvider';


const HrPrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isHR, isLoading } = useContext(AuthContext)!;
  const location = useLocation();

 
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101826]">
        <div className="w-10 h-10 border-4 border-[#E7A33E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/get-started" state={{ from: location }} replace />;
  }


  if (!isHR) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default HrPrivateRoute;