import axios from "axios";

export const axiosPublic = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true, // refreshToken httpOnly cookie পাঠানোর জন্য জরুরি
});

// একসাথে একাধিক 401 আসলেও refresh call যেন একবারই হয়
let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = axiosPublic
      .post("/auth/refresh")
      .then((res) => {
        const { accessToken } = res.data;
        localStorage.setItem("accessToken", accessToken);
        return accessToken;
      })
      .catch((err) => {
        localStorage.removeItem("accessToken");
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

export default axiosPublic;