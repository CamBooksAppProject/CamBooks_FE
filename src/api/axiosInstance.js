import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const BASE_URL = "http://127.0.0.1:8080/cambooks";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("[Request] URL:", config.url);
  console.log("[Request] Authorization:", config.headers.Authorization);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      Alert.alert("네트워크 오류", "서버에 연결할 수 없습니다.");
      return Promise.reject(error);
    }

    console.log("[Response Error] Status:", error.response.status);
    console.log("[Response Error] Data:", error.response.data);

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (!refreshToken) {
          // 리프레시 토큰 없으면 로그아웃 처리
          await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
          Alert.alert("로그인 만료", "로그인이 필요합니다.");
          // 여기에 navigation 이동이 안 되므로 상위 컴포넌트에서 처리하도록 reject
          return Promise.reject(new Error("리프레시 토큰 없음"));
        }

        const res = await refreshApi.post(
          "/member/refresh",
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          }
        );

        const newAccessToken = res.data.accessToken;
        if (!newAccessToken) {
          throw new Error("새로운 액세스 토큰 없음");
        }

        await AsyncStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error("[Token Refresh Error]", refreshError);
        await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
        Alert.alert("로그인 만료", "다시 로그인해주세요.");
        return Promise.reject(refreshError);
      }
    }

    if (error.response.status === 403) {
      Alert.alert(
        "권한 오류",
        "권한이 없습니다. 다시 로그인하거나 관리자에게 문의하세요."
      );
    }

    return Promise.reject(error);
  }
);

export default api;
