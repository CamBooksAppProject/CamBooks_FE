import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import api from "../../api/axiosInstance";

export default function PurchaseHistory() {
  const navigation = useNavigation();
  const [purchasedItems, setPurchasedItems] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      try {
        const res = await api.get("/mypage/purchases");
        setPurchasedItems(res.data);
      } catch (err) {
        console.error("구매 내역 가져오기 실패:", err);
        Alert.alert("오류", "구매 내역을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <Text style={styles.topFont}>구매 내역</Text>
        </View>
        <View style={{ width: "15%" }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {purchasedItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemContainer}
            onPress={() =>
              navigation.navigate("HomeDetailPage", { postId: item.id })
            }
          >
            <Image
              source={{
                uri: item.thumbnailUrl?.startsWith("http")
                  ? item.thumbnailUrl
                  : `${api.defaults.baseURL}${item.thumbnailUrl}`,
              }}
              style={styles.photo}
            />

            <View style={{ flexDirection: "column", marginLeft: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.collegeFont}>{item.university} </Text>
                <Text style={styles.title}>{item.title}</Text>
              </View>
              <Text style={styles.priceFont}>
                {item.price.toLocaleString()}원
              </Text>
              <View style={styles.iconRow}>
                <MaterialIcons name="favorite" size={16} color="#E57373" />
                <Text style={styles.iconFont}>{item.postLikeCount}</Text>
                <MaterialIcons name="remove-red-eye" size={16} color="#555" />
                <Text style={styles.iconFont}>{item.viewCount}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topContainer: {
    width: "100%",
    height: 60,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  topBtnContainer: {
    width: "15%",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 10,
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
    textAlign: "center",
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  photo: {
    width: 80,
    height: 80,
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
  collegeFont: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 5,
  },
  title: {
    fontSize: 14,
    color: "#333",
  },
  priceFont: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 5,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  iconFont: {
    fontSize: 12,
    color: "#666",
    marginRight: 10,
    marginLeft: 4,
  },
});
