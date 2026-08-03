import { Routes, Route } from "react-router";
import App from "./App";
import AuthPage from "./Common/AUTH/AuthPage";
import HrHome from "./Components/HR/HrHome";
import HrDashboard from "./Components/HR/HrDashboard";
import HrQuickTask from "./Components/HR/HrQuickTask";
import HrPrivateRoute from "./Components/HR/HrPrivate/HrPrivateRoute";
import HrManageEmployee from "./Components/HR/HrManageEmployee";
import EmHome from "./Components/Employee/EmHome";
import EmPrivateRoute from "./Components/Employee/EmPrivate/EmPrivateRoute";
import EmDashboard from "./Components/Employee/EmDashboard";

const RoutesAll = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/get-started" element={<AuthPage />} />

      <Route path="dashboard/hr" element={<HrPrivateRoute><HrHome /></HrPrivateRoute>}>
        <Route index element={<HrDashboard />} />
        <Route path="quick-task" element={<HrQuickTask />} />
        <Route path="manage-employees" element={<HrManageEmployee />} />
      </Route>


      <Route path="dashboard/employee" element={<EmPrivateRoute><EmHome /></EmPrivateRoute>}>
        <Route index element={<EmDashboard />} />
       
      </Route>
    </Routes>
  );
};

export default RoutesAll;
