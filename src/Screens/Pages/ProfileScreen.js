import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../api/axiosInstance";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [memberId, setMemberId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState("사용자");

  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true); // 로딩 상태 초기화
        const response = await api.get("/member/info");
        setUserInfo(response.data);

        const res = await api.get("/member/nickname");
        setNickname(res.data || "사용자");
      } catch (error) {
        console.error("사용자 정보 불러오기 실패:", error);
        Alert.alert("오류", "사용자 정보를 가져오지 못했습니다.");

        console.error("닉네임 불러오기 실패:", error);
        setNickname("사용자");
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchUserInfo();
    }
  }, [isFocused]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <SafeAreaView style={styles.container}>
        <View style={styles.userContainer}>
          <MaterialIcons name="account-circle" size={120} color="#ccc" />
          {loading ? (
            <Text style={styles.userText}>로딩중...</Text>
          ) : (
            <>
              <Text style={styles.userText}>{nickname}</Text>
              <View style={styles.locContainer}>
                <MaterialIcons name="location-on" size={18} color="#5E5E5E" />
                <Text style={styles.adsText}>
                  {userInfo?.address || "주소 정보 없음"}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.menuContainer}>
          <View style={styles.menuBox}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("MyPost")}
            >
              <MaterialIcons
                name="settings"
                size={26}
                color="#333"
                style={styles.setImg}
              />
              <Text style={styles.menuFont}>나의 글 관리</Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color="#999"
                style={styles.nextImg}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("PurchaseHistory")}
            >
              <MaterialIcons
                name="shopping-cart"
                size={26}
                color="#333"
                style={styles.setImg}
              />
              <Text style={styles.menuFont}>구매 내역</Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color="#999"
                style={styles.nextImg}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("SalesHistory")}
            >
              <MaterialIcons
                name="sell"
                size={26}
                color="#333"
                style={styles.setImg}
              />
              <Text style={styles.menuFont}>판매 내역</Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color="#999"
                style={styles.nextImg}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("NoticePage")}
            >
              <MaterialIcons
                name="help-outline"
                size={26}
                color="#333"
                style={styles.setImg}
              />
              <Text style={styles.menuFont}>자주묻는 질문</Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color="#999"
                style={styles.nextImg}
              />
            </TouchableOpacity>
          </View>
        </View>

        <StatusBar style="auto" />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  userContainer: {
    width: "100%",
    height: "30%",
    justifyContent: "center",
    alignItems: "center",
  },
  locContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  adsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5E5E5E",
  },
  userText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  menuContainer: {
    width: "100%",
    height: "55%",
    alignItems: "center",
  },
  menuBox: {
    width: "90%",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 12,
    backgroundColor: "#fff",
  },
  menuFont: {
    fontSize: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  setImg: {
    marginRight: 10,
  },
  nextImg: {
    marginLeft: "auto",
  },
});
