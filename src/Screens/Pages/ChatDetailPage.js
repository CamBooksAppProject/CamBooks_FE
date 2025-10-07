import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useState, useEffect, useCallback, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import api, { chatApi, BASE_HOST } from "../../api/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const ChatDetailPage = ({ route }) => {
  const { roomId, roomName, isGroupChat } = route.params;
  const navigation = useNavigation();
  const scrollViewRef = useRef();
  const clientRef = useRef(null);

  // 파라미터 디버깅
  console.log("ChatDetailPage 파라미터 받음:");
  console.log("- roomId:", roomId, "타입:", typeof roomId);
  console.log("- roomName:", roomName);
  console.log("- isGroupChat:", isGroupChat);

  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // 현재 사용자 이메일 가져오기 (서버 우선: 항상 백엔드 기준 이메일 보장)
  const getCurrentUserEmail = async () => {
    try {
      const res = await api.get("/member/info");
      if (res?.data?.email) {
        setCurrentUserEmail(res.data.email);
        await AsyncStorage.setItem("email", res.data.email);
        return;
      }
    } catch (error) {
      console.log("/member/info 조회 실패, 로컬 fallback 시도");
    }
    try {
      const storedEmail = await AsyncStorage.getItem("email");
      if (storedEmail && storedEmail.includes("@")) {
        setCurrentUserEmail(storedEmail);
      }
    } catch (e) {
      console.error("로컬 이메일 조회 실패:", e);
    }
  };

  // 채팅 히스토리 가져오기
  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const data = await chatApi.getChatHistory(roomId);
      setChatMessages(data);
      // 메시지 읽음 처리
      await chatApi.markAsRead(roomId);
    } catch (error) {
      console.error("채팅 히스토리 조회 실패:", error);
      Alert.alert("오류", "채팅 내역을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // WebSocket 연결 설정
  const connectWebSocket = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;

      // 기존 연결이 있으면 정리 후 재연결
      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
        } catch (e) {
          console.log("기존 STOMP 해제 중 오류:", e);
        }
        clientRef.current = null;
      }

      // 공통 axios 설정에서 호스트 사용 (에뮬레이터 호스트 보정 포함)
      const defaultHost = BASE_HOST;
      const HOST =
        Platform.OS === "android" && defaultHost.includes("localhost")
          ? defaultHost.replace("localhost", "10.0.2.2")
          : defaultHost;

      // STOMP 클라이언트 생성 (React Native 최적화)
      const client = new Client({
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: function (str) {
          console.log("STOMP Debug:", str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        // SockJS를 통한 연결: http(s)://<HOST>/connect
        webSocketFactory: () => new SockJS(`${HOST}/connect`),
      });

      client.onConnect = function (frame) {
        console.log("STOMP 연결 성공:", frame);
        setIsConnected(true);

        // 채팅방 구독 (Authorization 헤더 포함)
        client.subscribe(
          `/topic/${roomId}`,
          function (message) {
            try {
              const messageData = JSON.parse(message.body);
              console.log("새 메시지 수신:", messageData);

              // 새 메시지를 채팅 목록에 추가
              setChatMessages((prev) => [...prev, messageData]);

              // 스크롤을 맨 아래로
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            } catch (error) {
              console.error("메시지 파싱 오류:", error);
            }
          },
          {
            Authorization: `Bearer ${token}`,
          }
        );
      };

      client.onStompError = function (frame) {
        console.error("STOMP 오류:", frame.headers["message"]);
        console.error("Details:", frame.body);
        setIsConnected(false);
        Alert.alert("연결 오류", "채팅 서버 연결에 문제가 발생했습니다.");
      };

      client.onWebSocketError = function (event) {
        console.error("WebSocket 오류:", event);
        setIsConnected(false);
        // 자동 재연결은 reconnectDelay 설정으로 처리됨
      };

      client.onDisconnect = function () {
        console.log("STOMP 연결 해제");
        setIsConnected(false);
      };

      // 연결 활성화
      client.activate();
      setStompClient(client);
      clientRef.current = client;
    } catch (error) {
      console.error("WebSocket 연결 실패:", error);
    }
  };

  const sendMessage = () => {
    if (
      message.trim() &&
      stompClient &&
      stompClient.connected &&
      currentUserEmail
    ) {
      try {
        const messageData = {
          message: message.trim(),
          senderEmail: currentUserEmail,
        };

        // STOMP를 통해 메시지 전송 (Authorization 헤더 포함) - 최신 토큰 사용
        AsyncStorage.getItem("accessToken").then((latestToken) => {
          stompClient.publish({
            destination: `/publish/${roomId}`,
            body: JSON.stringify(messageData),
            headers: {
              Authorization: `Bearer ${latestToken || ""}`,
            },
          });
        });

        setMessage(""); // 입력창 초기화
        console.log("메시지 전송 성공:", messageData);
      } catch (error) {
        console.error("메시지 전송 실패:", error);
        Alert.alert("오류", "메시지 전송에 실패했습니다.");
      }
    } else if (!isConnected) {
      Alert.alert(
        "연결 오류",
        "서버와 연결이 끊어져 있습니다. 잠시 후 다시 시도해주세요."
      );
    } else if (!currentUserEmail) {
      Alert.alert(
        "오류",
        "사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  // 컴포넌트 마운트 시 실행
  useEffect(() => {
    getCurrentUserEmail();
  }, []);

  // 화면 포커스 시 채팅 히스토리 로드 및 WebSocket 연결
  useFocusEffect(
    useCallback(() => {
      fetchChatHistory();
      connectWebSocket();

      // 정리 함수
      return () => {
        console.log("화면 이탈: STOMP 정리 시도");
        try {
          if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
          }
        } catch (e) {
          console.log("STOMP 정리 오류:", e);
        }
        setStompClient(null);
        setIsConnected(false);
      };
    }, [roomId])
  );

  // 새 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.topContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>

          <View style={styles.topTitleContainer}>
            <Text style={styles.topFont}>{roomName}</Text>
            <Text style={styles.subTitle}>
              {isGroupChat === "Y" ? "그룹 채팅" : "1:1 채팅"}
              {!isConnected && " • 연결 중..."}
            </Text>
          </View>
          <View style={{ width: "15%" }}></View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#67574D" />
            <Text style={styles.loadingText}>채팅을 불러오는 중...</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {chatMessages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageContainer,
                  msg.senderEmail === currentUserEmail
                    ? styles.myMessage
                    : styles.otherMessage,
                ]}
              >
                <Text
                  style={[
                    styles.chatMessage,
                    {
                      color:
                        msg.senderEmail === currentUserEmail ? "#fff" : "#333",
                    },
                  ]}
                >
                  {msg.message}
                </Text>
                {msg.senderEmail !== currentUserEmail && (
                  <Text style={styles.senderName}>{msg.senderEmail}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        {/* 입력창과 전송 버튼 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="메시지를 입력하세요"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendButton, { opacity: message.trim() ? 1 : 0.5 }]}
            disabled={!message.trim()}
          >
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topContainer: {
    width: "100%",
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  topTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  topFont: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  subTitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#67574D",
    fontSize: 16,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  chatContent: {
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 18,
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: "#67574D",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  chatMessage: {
    fontSize: 16,
    lineHeight: 20,
  },
  senderName: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  backButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    backgroundColor: "#67574D",
    padding: 12,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatDetailPage;
