import { Routes, Route } from "react-router";
import App from "./App";

const RoutesAll = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
    </Routes>
  );
};

export default RoutesAll;
