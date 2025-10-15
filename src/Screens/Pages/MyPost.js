import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  FlatList,
  Image,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import api from "../../api/axiosInstance";
import IMAGES from "../../../assets";

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

  // 커뮤니티 게시글의 댓글 수를 가져오는 함수
  const fetchCommunityCommentCount = async (postId) => {
    try {
      const res = await api.get(`/community/comment/count?postId=${postId}`);
      return res.data || 0;
    } catch (error) {
      console.error(`커뮤니티 댓글 수 조회 실패 postId:${postId}`, error);
      return 0;
    }
  };

  // 자유게시판 게시글의 댓글 수를 가져오는 함수
  const fetchFreeBoardCommentCount = async (postId) => {
    try {
      const res = await api.get(
        `/general-forum/comment/count?postId=${postId}`
      );
      return res.data || 0;
    } catch (error) {
      console.error(`자유게시판 댓글 수 조회 실패 postId:${postId}`, error);
      return 0;
    }
  };

  const fetchCommunityPosts = async () => {
    try {
      const res = await api.get("/community");
      const postsWithCommentCount = await Promise.all(
        res.data.map(async (post) => {
          const commentCount = await fetchCommunityCommentCount(post.id);
          return {
            ...post,
            date: post.createdAt.slice(0, 10),
            commentCount,
            likeCount: post.postLikeCount || 0,
          };
        })
      );
      setCommunityPosts(postsWithCommentCount);
    } catch (error) {
      console.error("커뮤니티 글 불러오기 실패:", error);
    }
  };

  const fetchFreeBoardPosts = async () => {
    try {
      const res = await api.get("/general-forum");
      const postsWithCommentCount = await Promise.all(
        res.data.map(async (post) => {
          const commentCount = await fetchFreeBoardCommentCount(post.id);
          return {
            id: post.id,
            title: post.title,
            date: post.createdAt.slice(0, 10),
            commentCount,
            likeCount: post.postLikeCount || 0,
          };
        })
      );
      setFreeBoardPosts(postsWithCommentCount);
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

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchCommunityPosts(),
      fetchFreeBoardPosts(),
      fetchComments(),
    ]);
  }, []);

  // 페이지에 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [fetchAllData])
  );

  // 초기 로드
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
        <View style={styles.itemContent}>
          <View style={styles.textSection}>
            {activeTab === 2 ? (
              <Text
                style={styles.itemText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.content}
              </Text>
            ) : (
              <Text
                style={styles.itemText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>
            )}

            <View style={styles.metaInfo}>
              <View style={styles.leftMeta}>
                <MaterialIcons
                  name="account-circle"
                  size={16}
                  color="#ccc"
                  style={{ marginRight: 5 }}
                />

                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              <View style={styles.rightMeta}>
                {activeTab !== 2 && (
                  <>
                    <Image source={IMAGES.REDHEART} style={styles.iconImage} />
                    <Text style={styles.iconText}>{item.likeCount || 0}</Text>
                    <Image source={IMAGES.COMMENT} style={styles.iconImage} />
                    <Text style={styles.iconText}>
                      {item.commentCount || 0}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
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
          paddingHorizontal: wp(4),
          paddingTop: hp(1),
          flexGrow: 1,
          paddingBottom: hp(2),
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
    height: hp(8),
    paddingTop: hp(1),
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#CDCDCD",
  },
  topBtnContainer: {
    width: "15%",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backButton: {
    width: wp(10),
    justifyContent: "center",
    alignItems: "center",
  },
  topTitleContainer: {
    width: "70%",
    justifyContent: "center",
    alignItems: "center",
  },
  topFont: {
    fontSize: wp(5),
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  tabContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: hp(1),
    paddingTop: hp(2),
  },
  tabButton: {
    width: wp(22),
    height: hp(4.5),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#67574D",
    borderRadius: wp(5),
    marginHorizontal: wp(1.5),
  },
  activeTab: {
    backgroundColor: "#67574D",
  },
  inactiveTab: {
    backgroundColor: "#fff",
  },
  tabText: {
    fontSize: wp(3.5),
    fontWeight: "500",
  },
  activeText: {
    color: "#fff",
  },
  inactiveText: {
    color: "#67574D",
  },
  itemContainer: {
    width: wp(92),
    backgroundColor: "white",
    alignSelf: "center",
    marginBottom: hp(1),
    borderBottomWidth: 0.5,
    borderBottomColor: "#CDCDCD",
    paddingVertical: hp(2),
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  textSection: {
    flex: 1,
    paddingHorizontal: wp(2),
  },
  itemText: {
    fontSize: wp(3.8),
    fontWeight: "600",
    color: "#333",
    marginBottom: hp(1),
    lineHeight: wp(5),
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(0.5),
  },
  leftMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileIcon: {
    width: wp(4),
    height: wp(4),
    marginRight: wp(1.5),
  },
  authorText: {
    fontSize: wp(3),
    color: "#666",
    marginRight: wp(2),
  },
  dateText: {
    fontSize: wp(2.8),
    color: "#888",
  },
  iconImage: {
    width: wp(3.5),
    height: wp(3.5),
    marginRight: wp(1),
    resizeMode: "contain",
  },
  iconText: {
    fontSize: wp(2.8),
    fontWeight: "bold",
    color: "#666",
    marginRight: wp(2),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(10),
  },
  emptyText: {
    fontSize: wp(4),
    color: "#999",
  },
});
