import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/axiosInstance"; // axios 인스턴스 import

export default function SearchOutput({ route, navigation }) {
  const { keyword, activeTab } = route.params; // activeTab을 route.params에서 받아온다고 가정
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!keyword) return;
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/search-result", {
          params: { keyword },
        });
        setItems(response.data);
      } catch (err) {
        setError(err.message || "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [keyword]);

  const handlePressItem = (item) => {
    //console.log("postType:", item.postType, "item:", item);

    switch (item.postType) {
      case "community":
        navigation.navigate("CommuDetailPage", { postId: item.id });
        break;
      case "generalForum":
        navigation.navigate("FreeBoardDetailPage", { postId: item.id });
        break;
      case "usedTrade":
        navigation.navigate("HomeDetailPage", { postId: item.id });
        break;
      default:
        console.warn("알 수 없는 postType:", item.postType);
        break;
    }
  };

  const renderItem = ({ item }) => {
    // postType을 한글 라벨로 매핑
    const postTypeLabel =
      {
        community: "커뮤니티",
        generalForum: "자유게시판",
        usedTrade: "중고거래",
      }[item.postType] || "기타";

    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => handlePressItem(item)}
      >
        <Text style={styles.postTypeLabel}>{postTypeLabel}</Text>

        <Text style={styles.title}>{item.title}</Text>
        {item.content ? (
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.content}>
            {item.content}
          </Text>
        ) : null}
        <Text style={styles.metaInfo}>
          작성일: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
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
          <Text style={styles.topFont}>검색</Text>
        </View>
        <View style={{ width: "15%" }} />
      </View>

      <View style={styles.container}>
        <Text style={styles.keyword}>“{keyword}”에 대한 결과입니다.</Text>

        {loading && <ActivityIndicator size="large" color="#000" />}

        {error && (
          <Text style={{ color: "red", marginTop: 10 }}>
            에러 발생: {error}
          </Text>
        )}

        {!loading && !error && (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={{ fontSize: 16, color: "gray", marginTop: 10 }}>
                관련된 게시물이 없습니다.
              </Text>
            }
            contentContainerStyle={{ paddingBottom: 10 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  input: {
    backgroundColor: "#F7F7F7",
    width: "65%",
    height: 45,
    marginVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  confirmButton: {
    backgroundColor: "#000",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  viewContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  popularTag: {
    backgroundColor: "#d3d3d3",
    borderRadius: 100,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  popularSearch: {
    fontSize: 14,
    textAlign: "center",
  },
  recentTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#d3d3d3",
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  recentSearch: {
    fontSize: 14,
    marginRight: 8,
  },
  closeBtn: {
    fontSize: 14,
    color: "#999",
  },
  listItem: {
    backgroundColor: "#f9f7f3",
    padding: 15,
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },
  content: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    lineHeight: 20,
  },
  metaInfo: {
    fontSize: 12,
    color: "#888",
    textAlign: "right",
  },

  keyword: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 10,
    marginVertical: 20,
    textAlign: "center",
  },

  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  topBtnContainer: {
    width: "15%",
  },
  backButton: {
    padding: 6,
  },
  topTitleContainer: {
    width: "70%",
    alignItems: "center",
  },
  topFont: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  postTypeLabel: {
    fontSize: 12,
    color: "#fff",
    backgroundColor: "#67574D",
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 18,
  },
});
