import axios from "axios";
import { useContext } from "react";
import { useNavigate } from "react-router";
import { refreshAccessToken } from "./axiosPublic";
import { AuthContext } from "../Common/AUTH/AuthProvider";


const axiosHr = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
});

const useAxiosHr = () => {
  const { logOut } = useContext(AuthContext)!;
  const navigate = useNavigate();

  axiosHr.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axiosHr.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/auth/refresh")
      ) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosHr(originalRequest);
        } catch (refreshError) {
          try {
            await logOut();
            navigate("/login");
          } catch (e) {
            console.error("Auto logout failed:", e);
          }
          return Promise.reject(refreshError);
        }
      }

      if (error.response?.status === 403) {
        navigate("/");
      }

      return Promise.reject(error);
    }
  );

  return axiosHr;
};

export default useAxiosHr;