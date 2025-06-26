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

    const skipAlertUrls = [
      "/member/check-password",
      "/member/find-id/send",
      "/member/find-id/verified",
      "/member/find-password/send",
      "/member/find-password/verified",
    ];
    const url = originalRequest.url || "";

    if (error.response.status === 401) {
      if (skipAlertUrls.some((skipUrl) => url.includes(skipUrl))) {
        Alert.alert("입력 오류", "입력하신 정보를 다시 확인해주세요.");
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = await AsyncStorage.getItem("refreshToken");

          if (!refreshToken) {
            await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
            Alert.alert("로그인 만료", "로그인이 필요합니다.");
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
    }

    if (error.response.status === 403) {
      Alert.alert(
        "권한 오류",
        "권한이 없습니다. 다시 로그인하거나 관리자에게 문의하세요."
      );
    }

    if (error.response.status === 400) {
      const message =
        error.response.data?.message ||
        "잘못된 요청입니다. 입력값을 확인하세요.";
      Alert.alert("요청 오류", message);
    }

    return Promise.reject(error);
  }
);

export default api;
