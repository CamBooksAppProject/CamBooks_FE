import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useState, useCallback } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { chatApi } from "../../api/axiosInstance";

export default function ChatScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(0);
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 0, title: "전체" },
    { id: 1, title: "1:1 채팅" },
    { id: 2, title: "그룹 채팅" },
  ];

  // 채팅방 목록 가져오기
  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const data = await chatApi.getMyChatRooms();
      setChatRooms(data);
    } catch (error) {
      console.error("채팅방 목록 조회 실패:", error);
      Alert.alert("오류", "채팅방 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 화면이 포커스될 때마다 채팅방 목록 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchChatRooms();
    }, [])
  );

  // 시간 포맷 함수
  const formatTime = (dateString) => {
    if (!dateString) return "";

    const messageDate = new Date(dateString);
    const now = new Date();
    const diff = now - messageDate;
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "방금 전";
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    // 7일 이상이면 날짜 표시
    const month = messageDate.getMonth() + 1;
    const day = messageDate.getDate();
    return `${month}/${day}`;
  };

  const renderChatItem = (item) => (
    <TouchableOpacity
      style={styles.rowContainer}
      key={item.roomId}
      onPress={() =>
        navigation.navigate("ChatDetailPage", {
          roomId: item.roomId,
          roomName: item.roomName,
          isGroupChat: item.isGroupChat,
        })
      }
    >
      <MaterialIcons
        name="person"
        size={50}
        color="#67574D"
        style={{ marginRight: 10 }}
      />
      <View style={styles.textContainer}>
        <View style={styles.nameTimeContainer}>
          <Text style={styles.nameText}>{item.roomName}</Text>
          <View style={styles.rightSection}>
            {item.lastMessageTime && (
              <Text style={styles.timeText}>
                {formatTime(item.lastMessageTime)}
              </Text>
            )}
            {item.unReadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unReadCount}</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {item.lastMessage || "아직 메시지가 없습니다"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const filteredChatData = chatRooms.filter((chat) => {
    if (activeTab === 0) return true;
    if (activeTab === 1 && chat.isGroupChat === "N") return true;
    if (activeTab === 2 && chat.isGroupChat === "Y") return true;
    return false;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id ? styles.activeTab : styles.inactiveTab,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id ? styles.activeText : styles.inactiveText,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.mainContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#67574D" />
            <Text style={styles.loadingText}>채팅방 목록을 불러오는 중...</Text>
          </View>
        ) : filteredChatData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>채팅방이 없습니다.</Text>
          </View>
        ) : (
          filteredChatData.map(renderChatItem)
        )}
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  tabContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  tabButton: {
    width: 65,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#67574D",
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: "#67574D",
  },
  inactiveTab: {
    backgroundColor: "#ffffff",
  },
  tabText: {
    fontWeight: "500",
  },
  activeText: {
    color: "#ffffff",
  },
  inactiveText: {
    color: "#000000",
  },
  mainContainer: {
    width: "100%",
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  textContainer: {
    flex: 1,
  },
  nameTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameText: {
    fontWeight: "bold",
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    color: "gray",
    fontSize: 12,
  },
  chatMessage: {
    color: "#555555",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
  unreadBadge: {
    backgroundColor: "#FF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
