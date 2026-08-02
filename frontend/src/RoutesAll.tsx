import { Routes, Route } from "react-router";
import App from "./App";
import AuthPage from "./Common/AUTH/AuthPage";

const RoutesAll = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/get-started" element={<AuthPage />} />
    </Routes>
  );
};

export default RoutesAll;
