import { Routes, Route } from "react-router";
import App from "./App";
import AuthPage from "./Common/AUTH/AuthPage";
import HrHome from "./Components/HR/HrHome";
import HrDashboard from "./Components/HR/HrDashboard";
import HrQuickTask from "./Components/HR/HrQuickTask";

const RoutesAll = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/get-started" element={<AuthPage />} />

      <Route path="dashboard" element={<HrHome />}>
        <Route index element={<HrDashboard />} />
        <Route path="quick-task" element={<HrQuickTask />} />
      </Route>
    </Routes>
  );
};

export default RoutesAll;
