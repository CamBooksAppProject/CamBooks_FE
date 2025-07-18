import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/axiosInstance";

export default function MyPost() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(0);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [freeBoardPosts, setFreeBoardPosts] = useState([]);
  const [comments, setComments] = useState([]); // 댓글 상태

  const tabs = [
    { id: 0, title: "커뮤니티" },
    { id: 1, title: "자유게시판" },
    { id: 2, title: "댓글" },
  ];

  useEffect(() => {
    const fetchCommunityPosts = async () => {
      try {
        const res = await api.get("/community");
        setCommunityPosts(res.data);
      } catch (error) {
        console.error("커뮤니티 글 불러오기 실패:", error);
      }
    };

    const fetchFreeBoardPosts = async () => {
      try {
        const res = await api.get("/general-forum");
        const transformed = res.data.map((post) => ({
          id: post.id,
          title: post.title,
          date: post.createdAt.slice(0, 10),
        }));
        setFreeBoardPosts(transformed);
      } catch (error) {
        console.error("자유게시판 글 불러오기 실패:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await api.get("/general-forum/comment/my");
        const transformed = res.data.map((comment) => ({
          id: comment.id.toString(),
          content: comment.content,
          date: comment.createdAt.slice(0, 10),
          postId: comment.postId,
        }));
        setComments(transformed);
      } catch (error) {
        console.error("댓글 불러오기 실패:", error);
      }
    };

    fetchCommunityPosts();
    fetchFreeBoardPosts();
    fetchComments();
  }, []);

  const getDataByTab = () => {
    if (activeTab === 0) return communityPosts;
    if (activeTab === 1) return freeBoardPosts;
    if (activeTab === 2) return comments;
    return [];
  };

  const handlePressItem = (item) => {
    if (activeTab === 0) {
      navigation.navigate("CommuDetailPage", { postId: item.id });
    } else if (activeTab === 1) {
      navigation.navigate("FreeBoardDetailPage", { postId: item.id });
    } else if (activeTab === 2) {
      navigation.navigate("FreeBoardDetailPage", { postId: item.postId });
    }
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handlePressItem(item)}
      >
        <View style={{ flex: 1 }}>
          {activeTab === 2 ? (
            <Text style={styles.itemText}>{item.content}</Text>
          ) : (
            <Text style={styles.itemText}>{item.title}</Text>
          )}
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.topBtnContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.topTitleContainer}>
          <Text style={styles.topFont}>내 글 관리</Text>
        </View>
        <View style={{ width: "15%" }}></View>
      </View>

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

      <FlatList
        data={getDataByTab()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>게시글이 없습니다.</Text>
          </View>
        }
      />

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topContainer: {
    width: "100%",
    height: 60,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  topBtnContainer: {
    width: "15%",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backButton: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  topTitleContainer: {
    width: "70%",
    justifyContent: "center",
    alignItems: "center",
  },
  topFont: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  tabContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  tabButton: {
    width: 85,
    height: 34,
    marginTop: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#67574D",
    borderRadius: 20,
    marginHorizontal: 6,
  },
  activeTab: {
    backgroundColor: "#67574D",
  },
  inactiveTab: {
    backgroundColor: "#fff",
  },
  tabText: {
    fontWeight: "500",
  },
  activeText: {
    color: "#fff",
  },
  inactiveText: {
    color: "#000",
  },
  itemContainer: {
    backgroundColor: "#f9f7f3",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dateText: {
    marginTop: 6,
    fontSize: 12,
    color: "#888",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "top",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
