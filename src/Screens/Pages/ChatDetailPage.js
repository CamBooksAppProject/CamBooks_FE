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
  Image,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useState, useEffect, useCallback, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import api, { chatApi, BASE_HOST } from "../../api/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const ChatDetailPage = ({ route }) => {
  const { roomId, roomName, isGroupChat, postSummary } = route.params;
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
  const [showMenuSlider, setShowMenuSlider] = useState(false);
  const [participants, setParticipants] = useState([]);

  // 슬라이더 애니메이션
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").width)
  ).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // 채팅 상단 게시글 배너(지속 표시용)
  const [banner, setBanner] = useState(postSummary || null);

  const loadPersistedBanner = async () => {
    try {
      const saved = await AsyncStorage.getItem(`chat_post_summary_${roomId}`);
      if (saved) {
        setBanner(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("배너 로드 실패", e);
    }
  };

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

  // 메뉴 슬라이더 열기
  const openMenuSlider = () => {
    console.log("메뉴 열기 - participants:", participants);
    console.log("메뉴 열기 - roomName:", roomName);
    console.log("메뉴 열기 - isGroupChat:", isGroupChat);
    setShowMenuSlider(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 메뉴 슬라이더 닫기
  const closeMenuSlider = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: Dimensions.get("window").width,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowMenuSlider(false);
    });
  };

  // 채팅방 나가기
  const handleLeaveChatRoom = async () => {
    closeMenuSlider();
    Alert.alert("채팅방 나가기", "정말 채팅방을 나가시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "나가기",
        style: "destructive",
        onPress: async () => {
          try {
            await chatApi.leaveChatRoom(roomId);
            Alert.alert("성공", "채팅방을 나갔습니다.", [
              {
                text: "확인",
                onPress: () => navigation.goBack(),
              },
            ]);
          } catch (error) {
            console.error("채팅방 나가기 실패:", error);
            Alert.alert("오류", "채팅방 나가기에 실패했습니다.");
          }
        },
      },
    ]);
  };

  // 메시지에서 참여자 정보 추출
  const extractParticipants = (messages, userEmail) => {
    if (!messages || messages.length === 0) return [];

    const participantMap = new Map();
    messages.forEach((msg) => {
      if (msg.senderEmail && msg.senderEmail !== userEmail) {
        if (!participantMap.has(msg.senderEmail)) {
          participantMap.set(msg.senderEmail, {
            email: msg.senderEmail,
            nickname: msg.senderEmail.split("@")[0], // 임시로 이메일에서 추출
          });
        }
      }
    });

    return Array.from(participantMap.values());
  };

  // 채팅 히스토리 가져오기
  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const data = await chatApi.getChatHistory(roomId);
      setChatMessages(data);

      // 참여자 정보 추출 (currentUserEmail 사용)
      const extractedParticipants = extractParticipants(data, currentUserEmail);
      console.log("추출된 참여자:", extractedParticipants);
      setParticipants(extractedParticipants);

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
              setChatMessages((prev) => {
                const newMessages = [...prev, messageData];

                // 참여자 정보 업데이트 (currentUserEmail 사용)
                const participantMap = new Map();
                newMessages.forEach((msg) => {
                  if (msg.senderEmail && msg.senderEmail !== currentUserEmail) {
                    if (!participantMap.has(msg.senderEmail)) {
                      participantMap.set(msg.senderEmail, {
                        email: msg.senderEmail,
                        nickname: msg.senderEmail.split("@")[0],
                      });
                    }
                  }
                });
                const newParticipants = Array.from(participantMap.values());
                console.log("WebSocket 참여자 업데이트:", newParticipants);
                setParticipants(newParticipants);

                return newMessages;
              });

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
    if (!postSummary) {
      loadPersistedBanner();
    }
  }, []);

  // 화면 포커스 시 채팅 히스토리 로드 및 WebSocket 연결
  useFocusEffect(
    useCallback(() => {
      if (currentUserEmail) {
        fetchChatHistory();
      }
      connectWebSocket();
      // 배너 상태 최신화 (판매중/판매완료 등)
      (async () => {
        try {
          if (banner?.postId) {
            const detail = await chatApi.getUsedTradeDetail(banner.postId);
            // 상태 필드 네이밍에 따라 매핑 (예: status가 SOLD이면 판매완료)
            const newBadge = detail?.status === "SOLD" ? "판매완료" : "판매중";
            setBanner((prev) => ({ ...(prev || {}), badgeText: newBadge }));
            await AsyncStorage.setItem(
              `chat_post_summary_${roomId}`,
              JSON.stringify({ ...(banner || {}), badgeText: newBadge })
            );
          }
        } catch (e) {
          console.log("배너 상태 갱신 실패", e);
        }
      })();

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
    }, [roomId, currentUserEmail])
  );

  // 새 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  // 시간 포맷 (오전/오후 HH:MM)
  const formatKoreanTime = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours < 12 ? "오전" : "오후";
    const hh = (hours % 12 || 12).toString().padStart(2, "0");
    const mm = minutes.toString().padStart(2, "0");
    return `${period} ${hh}:${mm}`;
  };

  // 날짜 라벨 (오늘/어제/yyyy.MM.dd)
  const formatDateLabel = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    const startOfDay = (dt) =>
      new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const diffDays = Math.floor((startOfDay(today) - startOfDay(d)) / oneDay);

    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "어제";
    const yyyy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const dd = d.getDate().toString().padStart(2, "0");
    return `${yyyy}.${mm}.${dd}`;
  };

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
          <TouchableOpacity style={styles.menuButton} onPress={openMenuSlider}>
            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#67574D" />
            <Text style={styles.loadingText}>채팅을 불러오는 중...</Text>
          </View>
        ) : (
          <>
            {banner && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.postBanner, { marginTop: 6 }]}
                onPress={() => {
                  try {
                    if (banner?.postId) {
                      navigation.navigate("HomeDetailPage", {
                        postId: banner.postId,
                      });
                    }
                  } catch (e) {
                    console.warn("배너 클릭 이동 실패", e);
                  }
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {banner.thumbnail && (
                    <Image
                      source={{ uri: banner.thumbnail }}
                      style={styles.thumbWrap}
                      resizeMode="cover"
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={{ fontWeight: "600", marginBottom: 4 }}
                    >
                      {banner.title}
                    </Text>
                    <Text style={{ color: "#67574D", fontWeight: "700" }}>
                      {typeof banner.price === "number"
                        ? `${banner.price.toLocaleString()}원`
                        : banner.price}
                    </Text>
                  </View>
                  {banner.badgeText && (
                    <View style={styles.postBadge}>
                      <Text style={{ color: "#fff", fontSize: 12 }}>
                        {banner.badgeText}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}

            <ScrollView
              ref={scrollViewRef}
              style={styles.chatContainer}
              contentContainerStyle={styles.chatContent}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }
            >
              {chatMessages.map((msg, index) => {
                const isMe = msg.senderEmail === currentUserEmail;
                return (
                  <View
                    key={index}
                    style={{
                      marginBottom: 10,
                      alignItems: isMe ? "flex-end" : "flex-start",
                      width: "100%",
                    }}
                  >
                    <View style={styles.messageRow}>
                      {isMe && msg.createdTime && (
                        <Text style={[styles.msgTime, { marginRight: 6 }]}>
                          {formatKoreanTime(msg.createdTime)}
                        </Text>
                      )}

                      <View
                        style={[
                          styles.messageContainer,
                          isMe ? styles.myMessage : styles.otherMessage,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chatMessage,
                            { color: isMe ? "#fff" : "#333" },
                          ]}
                        >
                          {msg.message}
                        </Text>
                      </View>

                      {!isMe && msg.createdTime && (
                        <Text style={[styles.msgTime, { marginLeft: 6 }]}>
                          {formatKoreanTime(msg.createdTime)}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </>
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

        {/* 메뉴 슬라이더 */}
        <Modal
          visible={showMenuSlider}
          transparent={true}
          animationType="none"
          onRequestClose={closeMenuSlider}
        >
          <Animated.View
            style={[
              styles.sliderOverlay,
              {
                opacity: overlayOpacity,
              },
            ]}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={closeMenuSlider}
            />
            <Animated.View
              style={[
                styles.sliderContainer,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <View style={styles.sliderContent}>
                <View style={styles.profileSection}>
                  {isGroupChat === "Y" ? (
                    // 그룹 채팅: 참여자 리스트
                    <ScrollView style={styles.participantsList}>
                      {participants.length > 0 ? (
                        participants.map((participant, index) => (
                          <View key={index} style={styles.participantItem}>
                            <View style={styles.participantImageContainer}>
                              <Ionicons
                                name="person-circle"
                                size={50}
                                color="#ddd"
                              />
                            </View>
                            <View style={styles.participantInfo}>
                              <Text style={styles.participantName}>
                                {participant.nickname}
                              </Text>
                              <Text style={styles.participantEmail}>
                                {participant.email}
                              </Text>
                            </View>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.emptyText}>
                          참여자 정보가 없습니다
                        </Text>
                      )}
                    </ScrollView>
                  ) : (
                    // 1:1 채팅: 단일 프로필
                    <View style={styles.singleProfileContainer}>
                      <View style={styles.profileImageContainer}>
                        <Ionicons name="person-circle" size={80} color="#ddd" />
                      </View>
                      <Text style={styles.profileName}>
                        {participants.length > 0
                          ? participants[0].nickname
                          : roomName}
                      </Text>
                      <Text style={styles.profileEmail}>
                        {participants.length > 0 ? participants[0].email : ""}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.divider} />

                <View style={styles.menuItems}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleLeaveChatRoom}
                  >
                    <Text style={styles.menuItemText}>채팅방 나가기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>
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
  postBanner: {
    marginHorizontal: 4,
    marginBottom: 8,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f2f2f2",
  },
  thumbWrap: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginRight: 10,
    overflow: "hidden",
  },
  thumbImageWrap: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 8,
    left: 12,
    backgroundColor: "#eee",
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
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    maxWidth: "100%",
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
  msgTime: {
    fontSize: 10,
    color: "#888",
    marginTop: 0,
  },
  dateDividerWrap: {
    alignItems: "center",
    marginVertical: 8,
  },
  dateDividerText: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f3f3f3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
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
  menuButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "15%",
  },
  sliderOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  sliderContainer: {
    width: "80%",
    height: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  sliderContent: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
    paddingTop: 100,
    borderTopLeftRadius: 20,
    backgroundColor: "#f9f9f9",
  },
  singleProfileContainer: {
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  profileImageContainer: {
    marginBottom: 15,
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eee",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  participantsList: {
    flex: 1,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  participantImageContainer: {
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  participantEmail: {
    fontSize: 13,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 20,
  },
  menuItems: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: "#FF4444",
    marginLeft: 15,
    fontWeight: "500",
  },
});

export default ChatDetailPage;
