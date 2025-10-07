import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const BASE_URL = "http://192.168.0.23:8080/cambooks";
export const BASE_HOST = BASE_URL.replace(/\/?cambooks\/?$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 백엔드에 토큰 재발급(/member/refresh) API가 없으므로 별도 refreshApi 불필요

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
      // 백엔드에 리프레시 토큰 플로우가 없으므로 바로 로그아웃 처리
      await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
      Alert.alert("로그인 만료", "다시 로그인해주세요.");
      return Promise.reject(error);
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

// 채팅 API 함수들
export const chatApi = {
  // 1대1 채팅방 생성 또는 기존 채팅방 가져오기
  createOrGetPrivateRoom: async (memberId) => {
    console.log("API 호출 시작 - memberId:", memberId);
    const response = await api.post(
      `/chat/room/private/create?otherMemberId=${memberId}`
    );
    console.log("API 응답:", response);
    console.log("API 응답 데이터:", response.data);
    console.log("응답 데이터 타입:", typeof response.data);
    return response.data; // roomId 반환
  },

  // 내 채팅방 목록 조회
  getMyChatRooms: async () => {
    const response = await api.get("/chat/my/rooms");
    return response.data;
  },

  // 채팅방 히스토리 조회
  getChatHistory: async (roomId) => {
    const response = await api.get(`/chat/history/${roomId}`);
    return response.data;
  },

  // 채팅 메시지 읽음 처리
  markAsRead: async (roomId) => {
    const response = await api.post(`/chat/room/${roomId}/read`);
    return response.data;
  },

  // 채팅방 나가기
  leaveChatRoom: async (roomId) => {
    const response = await api.delete(`/chat/room/${roomId}/leave`);
    return response.data;
  },
};

export default api;
