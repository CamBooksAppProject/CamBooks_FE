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
  const isMounted = useRef(true);
  const subscriptionRef = useRef(null);

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
  const [participantsLoading, setParticipantsLoading] = useState(false);

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
  const openMenuSlider = async () => {
    console.log("메뉴 열기 - roomName:", roomName, "isGroupChat:", isGroupChat);
    setParticipantsLoading(true);
    setShowMenuSlider(true); // 모달을 먼저 보이게 함

    // 애니메이션 시작
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

    // 데이터 로딩 (애니메이션과 동시에)
    if (isGroupChat === "Y") {
      try {
        if (!currentUserEmail) {
          await getCurrentUserEmail();
        }

        const serverParticipants = await chatApi.getRoomParticipants(roomId);
        console.log("서버 원시 참여자 응답:", serverParticipants);

        let raw = serverParticipants;
        if (raw && raw.data && Array.isArray(raw.data)) raw = raw.data;

        let serverArray = [];
        if (Array.isArray(raw)) serverArray = raw;
        else if (raw && Array.isArray(raw.members)) serverArray = raw.members;
        else if (raw && Array.isArray(raw.result)) serverArray = raw.result;
        else if (raw && raw.data && Array.isArray(raw.data))
          serverArray = raw.data;
        else serverArray = [];

        const mapped = serverArray.map((m, idx) => {
          const email =
            (m && (m.email || m.memberEmail || m.userEmail)) ||
            (typeof m === "string" ? m : null);
          const nickname =
            (m && (m.nickname || m.name || m.nick || m.displayName)) ||
            (email ? email.split("@")[0] : `참여자${idx + 1}`);
          const profileImage = (m && (m.profileImage || m.avatar)) || null;
          const isOwner = !!(
            (m && (m.isOwner || m.owner || m.creator || m.isHost)) ||
            (m &&
              typeof m.role === "string" &&
              m.role.toUpperCase() === "OWNER")
          );
          return {
            email: email || null,
            nickname: nickname || "알 수 없음",
            profileImage,
            isOwner: isOwner,
          };
        });

        console.log("정규화된 서버 참여자 목록:", mapped);

        const byKey = new Map();
        mapped.forEach((p) => {
          const key = p.email || p.nickname;
          if (!byKey.has(key)) byKey.set(key, p);
        });

        if (currentUserEmail) {
          const meKey = currentUserEmail;
          const existing = byKey.get(meKey);
          if (existing) {
            existing.nickname = existing.nickname + " (나)";
            byKey.set(meKey, existing);
          } else {
            byKey.set(meKey, {
              email: currentUserEmail,
              nickname: currentUserEmail.split("@")[0] + " (나)",
              profileImage: null,
            });
          }
        }

        // 우선순위: 방장(isOwner)이 있으면 맨 앞으로
        const allValues = Array.from(byKey.values());
        const owners = allValues.filter((p) => p.isOwner);
        const others = allValues.filter((p) => !p.isOwner);
        let finalList = [...owners, ...others];

        // 서버에서 이메일이 없고 nickname이 '참여자N' 같은 placeholder로만 들어오는 경우,
        // 채팅 히스토리에서 실제 닉네임(및 이메일)을 빈도 기반으로 추출하여 매핑 시도합니다.
        const normalizeEmail = (e) =>
          e ? String(e).trim().toLowerCase() : null;

        const placeholders = finalList.filter(
          (p) => !p.email && /^참여자\d+/.test(p.nickname)
        );

        if (
          placeholders.length > 0 &&
          chatMessages &&
          chatMessages.length > 0
        ) {
          // 히스토리에서 발신자별 빈도 집계 (나 제외)
          const freq = new Map();
          chatMessages.forEach((m) => {
            const em = m.senderEmail || null;
            const nm = m.senderNickname || (em ? em.split("@")[0] : null);
            if (!nm) return;
            if (
              currentUserEmail &&
              em &&
              normalizeEmail(em) === normalizeEmail(currentUserEmail)
            )
              return;
            const key = em ? normalizeEmail(em) : nm;
            const entry = freq.get(key) || {
              nickname: nm,
              email: em,
              count: 0,
            };
            entry.count += 1;
            freq.set(key, entry);
          });

          // 빈도 내림차순으로 정렬된 후보 목록
          const uniqueFromHistory = Array.from(freq.values()).sort(
            (a, b) => b.count - a.count
          );

          if (uniqueFromHistory.length > 0) {
            let histIndex = 0;
            finalList = finalList.map((p) => {
              if (
                !p.email &&
                /^참여자\d+/.test(p.nickname) &&
                histIndex < uniqueFromHistory.length
              ) {
                const u = uniqueFromHistory[histIndex++];
                return {
                  ...p,
                  nickname: u.nickname,
                  email: u.email || p.email,
                };
              }
              return p;
            });
            console.log(
              "참여자 자리표시자 대체 (히스토리 기반, 빈도순):",
              finalList
            );
          }
        }

        // 중복/자리표시자 보정 후 이메일(정규화) 또는 닉네임 기준으로 재병합해서 중복 제거
        const mergedMap = new Map();
        finalList.forEach((p) => {
          const emailKey = p.email ? normalizeEmail(p.email) : null;
          const key = emailKey || p.nickname;
          if (!mergedMap.has(key))
            mergedMap.set(key, { ...p, email: emailKey || p.email });
          else {
            const ex = mergedMap.get(key);
            const isPlaceholder = (n) => !n || /^참여자\d+/.test(n);
            if (isPlaceholder(ex.nickname) && !isPlaceholder(p.nickname))
              ex.nickname = p.nickname;
            ex.isOwner = ex.isOwner || p.isOwner;
            if (!ex.profileImage && p.profileImage)
              ex.profileImage = p.profileImage;
            if (!ex.email && p.email) ex.email = normalizeEmail(p.email);
          }
        });

        const tempArr = Array.from(mergedMap.values());
        const finalUnique = [];
        const emailIndex = new Map();
        tempArr.forEach((p) => {
          const eKey = p.email ? normalizeEmail(p.email) : null;
          if (eKey) {
            if (emailIndex.has(eKey)) {
              const idx = emailIndex.get(eKey);
              const ex = finalUnique[idx];
              const isPlaceholder = (n) => !n || /^참여자\d+/.test(n);
              if (isPlaceholder(ex.nickname) && !isPlaceholder(p.nickname))
                ex.nickname = p.nickname;
              ex.isOwner = ex.isOwner || p.isOwner;
              if (!ex.profileImage && p.profileImage)
                ex.profileImage = p.profileImage;
            } else {
              emailIndex.set(eKey, finalUnique.length);
              finalUnique.push({ ...p, email: eKey });
            }
          } else {
            // 이메일이 없는 경우 닉네임 기반으로 추가
            finalUnique.push({ ...p });
          }
        });

        // 현재 사용자 '(나)' 표기 보장 (정규화된 이메일 비교)
        if (currentUserEmail) {
          const myKey = normalizeEmail(currentUserEmail);
          const meIdx = finalUnique.findIndex(
            (x) => normalizeEmail(x.email) === myKey
          );
          if (meIdx >= 0) {
            if (!finalUnique[meIdx].nickname.includes("(나)")) {
              finalUnique[
                meIdx
              ].nickname = `${finalUnique[meIdx].nickname} (나)`;
            }
          } else {
            finalUnique.push({
              email: myKey,
              nickname: `${myKey.split("@")[0]} (나)`,
              profileImage: null,
              isOwner: false,
            });
          }
        }

        finalList = finalUnique;
        console.log("설정된 참여자 목록(서버->정규화->최종):", finalList);

        if (finalList.length <= 1) {
          console.log(
            "서버 참여자에 현재 사용자만 있음 — 히스토리 기반 추가 검토"
          );
          const extracted = extractParticipants(chatMessages, currentUserEmail);
          const merged = [...finalList];
          const seenKeys = new Set(merged.map((p) => p.email || p.nickname));
          extracted.forEach((p) => {
            const key = p.email || p.nickname;
            if (!seenKeys.has(key)) {
              merged.push(p);
              seenKeys.add(key);
            }
          });
          console.log("서버+히스토리 병합 참여자 목록:", merged);
          setParticipants(merged);
        } else {
          setParticipants(finalList);
        }
      } catch (e) {
        console.warn(
          "참여자 목록 조회 실패, 히스토리에서 추출한 참여자 사용",
          e
        );
        try {
          const extracted = extractParticipants(chatMessages, currentUserEmail);
          const list = [];
          const seen = new Set();

          if (currentUserEmail) {
            const meNickname = currentUserEmail.split("@")[0] + " (나)";
            list.push({ email: currentUserEmail, nickname: meNickname });
            seen.add(currentUserEmail);
          }

          extracted.forEach((p) => {
            if (p.email && !seen.has(p.email)) {
              seen.add(p.email);
              list.push(p);
            }
          });

          setParticipants(list);
          console.log("히스토리에서 추출된 참여자 목록:", list);
        } catch (ex) {
          console.warn("히스토리에서 참여자 추출 중 오류:", ex);
          setParticipants([]);
        }
      }
    } else {
      // 1:1 채팅: 히스토리에서 상대방 정보를 사용하거나 roomName 대체
      const extracted = extractParticipants(chatMessages, currentUserEmail);
      if (extracted && extracted.length > 0) {
        setParticipants(extracted.map((p) => ({ ...p })));
      } else {
        setParticipants([{ email: "", nickname: roomName }]);
      }
    }

    setParticipantsLoading(false);
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
      setParticipantsLoading(false); // 닫힐 때 로딩 상태 초기화
    });
  };

  // 채팅방 나가기
  const handleLeaveChatRoom = async () => {
    closeMenuSlider();
    // Alert.alert이 닫기 애니메이션을 방해하지 않도록 살짝 지연
    setTimeout(() => {
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
              if (isGroupChat === "Y") {
                await chatApi.leaveGroupChatRoom(roomId);
              } else {
                await chatApi.leaveChatRoom(roomId);
              }
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
    }, 400); // 닫기 애니메이션 시간(300ms)보다 약간 길게
  };

  // 메시지에서 참여자 정보 추출
  const extractParticipants = (messages, userEmail) => {
    if (!messages || messages.length === 0) return [];

    const participantMap = new Map();
    messages.forEach((msg) => {
      const email = msg.senderEmail;
      const nickname = msg.senderNickname || (email ? email.split("@")[0] : "");
      if (email && email !== userEmail) {
        if (!participantMap.has(email)) {
          // 방장 여부 추정: postSummary에 creator/seller/author 관련 필드가 있을 수 있음
          const ownerEmails = [
            postSummary?.ownerEmail,
            postSummary?.sellerEmail,
            postSummary?.authorEmail,
            postSummary?.writerEmail,
            postSummary?.userEmail,
          ].filter(Boolean);
          const isOwner = ownerEmails.includes(email);
          participantMap.set(email, {
            email,
            nickname,
            isOwner,
          });
        }
      }
    });

    return Array.from(participantMap.values());
  };

  // 참여자 표시용 이름 결정 (서버 데이터, 히스토리, postSummary 순으로 보완)
  const getParticipantDisplayName = (participant) => {
    if (!participant) return "알 수 없음";
    // 우선 서버에서 온 닉네임(백엔드가 제공하면 우선 사용)
    if (participant.nickname) {
      return participant.nickname;
    }

    // 이메일이 있으면 히스토리에서 해당 이메일의 닉네임을 찾아본다
    if (participant.email) {
      const fromHistory = (chatMessages || []).find(
        (m) => m && m.senderEmail === participant.email && m.senderNickname
      );
      if (fromHistory && fromHistory.senderNickname) {
        return fromHistory.senderNickname;
      }
    }

    // postSummary에 작성자/판매자 정보가 있으면 그쪽 닉네임 사용 시도
    const ownerCandidates = [
      postSummary?.ownerName,
      postSummary?.sellerName,
      postSummary?.authorName,
      postSummary?.writerName,
      postSummary?.userName,
    ].filter(Boolean);
    if (ownerCandidates.length > 0) return ownerCandidates[0];

    // 이메일이 있으면 앞부분
    if (participant.email) return participant.email.split("@")[0];

    // 마지막으로 기존 nickname이 있으면 그대로, 아니면 '알 수 없음'
    return participant.nickname || "알 수 없음";
  };

  // 채팅 히스토리 가져오기
  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const data = await chatApi.getChatHistory(roomId);
      // defensive: ensure data is an array
      if (!Array.isArray(data)) {
        console.warn("채팅 히스토리 응답이 배열이 아닙니다. 응답 내용:", data);
        // try to handle common cases where payload may be wrapped
        const maybeArray = data?.data || data?.result || [];
        if (Array.isArray(maybeArray)) {
          setChatMessages(maybeArray);
        } else {
          // unknown shape: set empty and log
          setChatMessages([]);
        }
      } else {
        setChatMessages(data);
      }

      // (참고) openMenuSlider에서 참여자 정보를 로드하므로 여기서는 생략
      // 필요시 여기서 미리 로드할 수 있습니다.
      // const extractedParticipants = extractParticipants(data, currentUserEmail);
      // setParticipants(extractedParticipants);

      await chatApi.markAsRead(roomId);
    } catch (error) {
      // axios 에러인지 확인하여 상세 정보 출력 (로깅 중 예외가 발생하지 않도록 방어)
      console.error("채팅 히스토리 조회 실패:", error?.message || error);
      try {
        if (error?.response) {
          console.error("[채팅 히스토리] 응답 상태:", error.response.status);
          try {
            console.error(
              "[채팅 히스토리] 응답 헤더:",
              JSON.stringify(error.response.headers)
            );
          } catch (hErr) {
            console.error(
              "[채팅 히스토리] 응답 헤더(직렬화 불가):",
              error.response.headers
            );
          }

          try {
            const respData =
              typeof error.response.data === "string"
                ? error.response.data
                : JSON.stringify(error.response.data);
            console.error("[채팅 히스토리] 응답 데이터:", respData);
          } catch (dErr) {
            console.error(
              "[채팅 히스토리] 응답 데이터(직렬화 실패):",
              error.response.data
            );
          }
        } else if (error?.request) {
          console.error(
            "[채팅 히스토리] 요청이 전송되었으나 응답을 받지 못했습니다. 요청 객체:",
            error.request
          );
        } else {
          console.error("[채팅 히스토리] 오류 상세:", error);
        }
      } catch (logErr) {
        console.error("채팅 히스토리 에러 로깅 중 예외 발생:", logErr);
      }

      // 사용자에게는 기존 경고 유지
      Alert.alert("오류", "채팅 내역을 불러오는데 실패했습니다.");
      // 안전하게 빈 배열로 초기화
      setChatMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket 연결 설정
  const connectWebSocket = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;

      if (clientRef.current && clientRef.current.active) {
        console.log(
          "이미 활성화된 STOMP 클라이언트가 있어 연결을 재사용합니다."
        );
        return;
      }

      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
        } catch (e) {
          console.log("기존 STOMP 해제 중 오류:", e);
        }
        clientRef.current = null;
      }

      const defaultHost = BASE_HOST;
      const HOST =
        Platform.OS === "android" && defaultHost.includes("localhost")
          ? defaultHost.replace("localhost", "10.0.2.2")
          : defaultHost;

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
        webSocketFactory: () => new SockJS(`${HOST}/connect`),
      });

      client.onConnect = function (frame) {
        console.log("STOMP 연결 성공:", frame);
        setIsConnected(true);

        try {
          if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe &&
              subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
          }
        } catch (e) {
          console.warn("기존 구독 해제 실패:", e);
        }
        // 구독: 채팅방 토픽을 구독하고 메시지 처리
        subscriptionRef.current = client.subscribe(
          `/topic/${roomId}`,
          function (message) {
            try {
              // raw body/headers 로그를 추가해서 서버에서 어떤 형식으로 오는지 확인
              console.log(
                "raw stomp body:",
                message.body,
                "headers:",
                message.headers
              );
              let messageData = {};
              try {
                messageData = JSON.parse(message.body);
              } catch (e) {
                // 일부 경우 서버가 이미 문자열화된 JSON을 전송하지 않을 수 있으므로
                // 그냥 전달된 값을 그대로 사용하도록 처리
                console.warn("JSON 파싱 실패, raw body 사용:", e);
                messageData =
                  typeof message.body === "string"
                    ? { message: message.body }
                    : message.body;
              }
              console.log("새 메시지 수신:", messageData);

              // 일부 메시지는 시스템 이벤트(예: 사용자 퇴장/입장)를 나타낼 수 있음
              // 타입 필드 비교는 대소문자 차이를 무시하도록 안전하게 처리
              const msgType = String(
                messageData?.type ||
                  messageData?.event ||
                  messageData?.action ||
                  ""
              ).toUpperCase();
              const textBody =
                typeof messageData?.message === "string"
                  ? messageData.message
                  : "";

              const isLeaveEvent =
                msgType === "LEAVE" ||
                msgType === "LEFT" ||
                msgType === "EXIT" ||
                messageData?.system === true ||
                messageData?.systemMessage === true ||
                /나갔습니다|left|退出|나감/.test(textBody);

              const isJoinEvent =
                msgType === "JOIN" ||
                msgType === "JOINED" ||
                msgType === "ENTER" ||
                /들어왔습니다|joined|entered|들어옴/.test(textBody);

              if (isLeaveEvent || isJoinEvent) {
                // 시스템 메시지로 변환하여 표시 (퇴장/입장 모두 처리)
                const who =
                  messageData?.nickname ||
                  messageData?.senderNickname ||
                  messageData?.sender ||
                  messageData?.name ||
                  messageData?.userName ||
                  (messageData?.senderEmail
                    ? messageData.senderEmail.split("@")[0]
                    : "사용자");
                let baseText = messageData?.message
                  ? messageData.message
                  : isLeaveEvent
                  ? `${who}님이 채팅방을 나갔습니다.`
                  : `${who}님이 채팅방에 들어왔습니다.`;
                const text = `----${baseText}----`;

                const sysMsg = {
                  system: true,
                  text,
                  createdTime:
                    messageData?.createdTime || new Date().toISOString(),
                };

                setChatMessages((prev) => {
                  const newMessages = [...prev, sysMsg];
                  return newMessages;
                });

                // 참여자 목록도 최신화: 히스토리 기반으로 다시 추출
                setTimeout(() => {
                  try {
                    const extracted = extractParticipants(
                      chatMessages.concat([]),
                      currentUserEmail
                    );
                    console.log("시스템 이벤트 후 추출된 참여자:", extracted);
                    setParticipants(extracted);
                  } catch (e) {
                    console.warn("시스템 이벤트 후 참여자 추출 실패:", e);
                  }
                }, 200);
              } else {
                // 새 일반 메시지를 채팅 목록에 추가
                setChatMessages((prev) => {
                  const newMessages = [...prev, messageData];

                  // 참여자 정보 업데이트 (currentUserEmail 사용)
                  const participantMap = new Map();
                  newMessages.forEach((msg) => {
                    const email = msg.senderEmail;
                    const nickname =
                      msg.senderNickname || (email ? email.split("@")[0] : "");
                    if (email && email !== currentUserEmail) {
                      if (!participantMap.has(email)) {
                        participantMap.set(email, { email, nickname });
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
              }
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
        console.warn("STOMP 오류:", frame?.headers?.["message"]);
        console.warn("Details:", frame?.body);
        if (isMounted.current) setIsConnected(false);
      };

      client.onWebSocketError = function (event) {
        try {
          const info = {};
          if (event) {
            if (typeof event === "string") info.message = event;
            else if (event instanceof Error) {
              info.message = event.message;
              info.stack = event.stack;
            } else if (event instanceof Object) {
              if (event.type) info.type = event.type;
              if (event.message) info.message = event.message;
              if (event.reason) info.reason = event.reason;
              if (event.code) info.code = event.code;
            }
          }
          console.warn("WebSocket 오류 상세:", info, "원본 이벤트:", event);

          if (isMounted.current) setIsConnected(false);

          setTimeout(() => {
            try {
              if (client && !client.active && isMounted.current) {
                console.log("WebSocket: 재연결 시도 (수동)");
                client.activate();
              }
            } catch (e) {
              console.warn("수동 재연결 시도 중 오류:", e);
            }
          }, 2000);
        } catch (e) {
          console.warn("onWebSocketError 처리 중 예외:", e);
        }
      };

      client.onDisconnect = function () {
        console.log("STOMP 연결 해제");
        setIsConnected(false);
      };

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

        AsyncStorage.getItem("accessToken").then((latestToken) => {
          stompClient.publish({
            destination: `/publish/${roomId}`,
            body: JSON.stringify(messageData),
            headers: {
              Authorization: `Bearer ${latestToken || ""}`,
            },
          });
        });

        setMessage("");
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
    return () => {
      isMounted.current = false;
    };
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
        try {
          if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe &&
              subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
          }
        } catch (e) {
          console.warn("구독 정리 중 오류:", e);
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
                // 시스템 메시지(퇴장 등)는 가운데 정렬된 회색 텍스트로 표시
                if (msg && msg.system) {
                  return (
                    <View
                      key={index}
                      style={{
                        width: "100%",
                        alignItems: "center",
                        marginVertical: 6,
                      }}
                    >
                      <Text style={styles.systemMessage}>{msg.text}</Text>
                    </View>
                  );
                }

                const isMe = msg.senderEmail === currentUserEmail;
                const prevMsg = index > 0 ? chatMessages[index - 1] : null;
                const showSenderName =
                  !isMe &&
                  isGroupChat === "Y" &&
                  msg.senderNickname &&
                  (!prevMsg || prevMsg.senderEmail !== msg.senderEmail);

                return (
                  <View
                    key={index}
                    style={{
                      marginBottom: 10,
                      alignItems: isMe ? "flex-end" : "flex-start",
                      width: "100%",
                    }}
                  >
                    {showSenderName && (
                      <Text
                        style={[
                          styles.senderName,
                          { marginLeft: isMe ? 0 : 6, marginBottom: 4 },
                        ]}
                      >
                        {msg.senderNickname}
                      </Text>
                    )}

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
          <View style={styles.modalContainer}>
            {/* 1. 반투명 배경 (Backdrop) */}
            <Animated.View
              style={[
                styles.modalBackdrop,
                {
                  opacity: overlayOpacity,
                },
              ]}
            >
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={closeMenuSlider}
              />
            </Animated.View>

            {/* 2. 슬라이더 본체 (애니메이션 적용) */}
            <Animated.View
              style={[
                styles.sliderContainer,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              {/* SafeAreaView를 슬라이더 *안에* 배치 */}
              <SafeAreaView style={styles.sliderSafeArea}>
                {/* 헤더: 닫기 버튼 추가 */}
                <View style={styles.sliderHeader}>
                  <Text style={styles.sectionTitle}>
                    {isGroupChat === "Y" ? "대화 상대" : "대화 정보"}
                  </Text>
                  <TouchableOpacity
                    onPress={closeMenuSlider}
                    style={styles.sliderCloseButton}
                  >
                    <Ionicons name="close" size={24} color="#555" />
                  </TouchableOpacity>
                </View>

                {/* 프로필/참여자 목록 (기존 profileSection) */}
                <View style={styles.profileSection}>
                  {isGroupChat === "Y" ? (
                    // 그룹 채팅: 참여자 리스트
                    <ScrollView style={styles.participantsList}>
                      {participantsLoading ? (
                        <ActivityIndicator
                          size="small"
                          color="#67574D"
                          style={{ marginVertical: 20 }}
                        />
                      ) : participants.length > 0 ? (
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
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <Text style={styles.participantName}>
                                  {getParticipantDisplayName(participant)}
                                </Text>
                                {participant.isOwner && (
                                  <View style={styles.ownerBadge}>
                                    <Text style={styles.ownerBadgeText}>
                                      방장
                                    </Text>
                                  </View>
                                )}
                              </View>
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
                          ? getParticipantDisplayName(participants[0])
                          : roomName}
                      </Text>
                      <Text style={styles.profileEmail}>
                        {participants.length > 0 ? participants[0].email : ""}
                      </Text>
                    </View>
                  )}
                </View>

                {/* 하단 고정 메뉴 (채팅방 나가기) */}
                <View style={styles.sliderFooter}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleLeaveChatRoom}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="exit-outline" size={20} color="#FF4444" />
                    <Text style={styles.menuItemText}>채팅방 나가기</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Animated.View>
          </View>
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
    paddingHorizontal: 10, // 좌우 패딩
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
  postBadge: {
    backgroundColor: "#67574D", // (예시)
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
  senderName: {
    fontSize: 13,
    color: "#444",
    marginTop: 4,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0", // 배경색 변경
    borderWidth: 0, // 테두리 제거
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10, // iOS 멀티라인 패딩 보정
    marginRight: 10,
    maxHeight: 120, // 최대 높이
    fontSize: 16,
  },
  backButton: {
    width: 48, // 고정 너비
    height: 48, // 고정 높이
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    backgroundColor: "#67574D",
    width: 44, // 원형 버튼
    height: 44, // 원형 버튼
    borderRadius: 22, // width/2
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 2, // 아이콘 중앙 보정
  },
  menuButton: {
    width: 48, // 고정 너비
    height: 48, // 고정 높이
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sliderContainer: {
    width: "85%", // 너비 85%
    height: "100%", // 높이 100%
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: -3, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  sliderSafeArea: {
    flex: 1,
    flexDirection: "column",
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sliderCloseButton: {
    padding: 4,
  },
  profileSection: {
    flex: 1, // 헤더와 푸터를 제외한 모든 공간 차지
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  singleProfileContainer: {
    alignItems: "center",
    paddingTop: 20, // 1:1 채팅 시 상단 여백
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
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
    marginBottom: 2,
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
  systemMessage: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
  },
  ownerBadge: {
    marginLeft: 8,
    backgroundColor: "#ffd966",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  ownerBadgeText: {
    fontSize: 12,
    color: "#5a3b00",
    fontWeight: "700",
  },
  sliderFooter: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: "#FF4444",
    marginLeft: 10, // 아이콘-텍스트 간격
    fontWeight: "500",
  },
});

export default ChatDetailPage;
