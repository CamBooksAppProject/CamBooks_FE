import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Switch } from "react-native-gesture-handler";

import SettingModal from "./SettingModal.js";
import IMAGES from "../../../assets";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { memberApi, BASE_HOST } from "../../api/axiosInstance";

export default function SettingPage() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [isChatEnabled, setIsChatEnabled] = useState(false);
  const [isCommunityEnabled, setIsCommunityEnabled] = useState(false);

  const [nickname, setNickname] = useState("사용자");
  const [profileImage, setProfileImage] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);

  // 닉네임 불러오기
  const fetchNickname = async () => {
    try {
      const res = await api.get("/member/nickname");
      setNickname(res.data || "사용자");
    } catch (error) {
      console.error("닉네임 불러오기 실패:", error);
      setNickname("사용자");
    }
  };

  // 프로필 이미지 불러오기
  const fetchProfileImage = async () => {
    try {
      const info = await memberApi.getMyInfo();
      if (info?.profileImage) {
        const full = info.profileImage.startsWith("http")
          ? info.profileImage
          : `${BASE_HOST}${info.profileImage}`;
        setProfileImage({ uri: full });
      } else {
        setProfileImage(null);
      }
    } catch (e) {
      console.error("프로필 이미지 불러오기 실패:", e);
      setProfileImage(null);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchNickname();
      fetchProfileImage();
    }
  }, [isFocused]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("accessToken"); // 저장한 토큰 삭제
      await AsyncStorage.removeItem("refreshToken"); // 있다면 이거도

      // 네비게이션 초기화하면서 로그인 스크린으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      });
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const handleWithdraw = async () => {
    try {
      await api.delete("/member/withdraw"); // DELETE API 호출
      // 탈퇴 성공 후 토큰 삭제 및 로그인 화면 이동
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");

      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      });
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      alert("회원 탈퇴에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const confirmWithdraw = () => {
    Alert.alert(
      "회원 탈퇴",
      "정말 탈퇴하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "확인",
          onPress: handleWithdraw,
        },
      ],
      { cancelable: true }
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
          <Text style={styles.topFont}>설정</Text>
        </View>
        <View style={{ width: "15%" }}></View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.myContainer}>
          <View style={styles.myImg}>
            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              {profileImage && profileImage.uri ? (
                <Image source={profileImage} style={styles.backImg} />
              ) : (
                <MaterialIcons name="account-circle" size={44} color="#ccc" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.myName}>
            <Text style={{ fontSize: 16 }}>{nickname}</Text>
          </View>
        </View>

        <View style={styles.mainContainer}>
          <View style={styles.menuBox}>
            <View style={styles.noneLineBox}>
              <Text style={[styles.menuFontBold, { marginTop: 10 }]}>계정</Text>
            </View>

            <TouchableOpacity
              style={styles.noneLineBox}
              onPress={() => navigation.navigate("MyInfo")}
            >
              <Text style={styles.menuFont}>내 정보</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.noneLineBox}
              onPress={() => navigation.navigate("ChangePw")}
            >
              <Text style={styles.menuFont}>비밀번호 변경</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.noneLineBox}
              onPress={() => navigation.navigate("ChangeAddr")}
            >
              <Text style={styles.menuFont}>주소 변경</Text>
            </TouchableOpacity>

            <View style={styles.lineBox}>
              <Text style={styles.menuFontBold}>알림</Text>
            </View>

            <View style={styles.switchLineBox}>
              <Text style={styles.menuFont}>채팅 알림</Text>
              <Switch
                style={styles.switchStyle}
                value={isChatEnabled}
                onValueChange={setIsChatEnabled}
              />
            </View>

            <View style={styles.switchLineBox}>
              <Text style={styles.menuFont}>커뮤니티 알림</Text>
              <Switch
                style={styles.switchStyle}
                value={isCommunityEnabled}
                onValueChange={setIsCommunityEnabled}
              />
            </View>

            <View style={styles.lineBox}>
              <Text style={styles.menuFontBold}>기타</Text>
            </View>

            <TouchableOpacity style={styles.noneLineBox} onPress={handleLogout}>
              <Text style={styles.menuFont}>로그아웃</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.noneLineBox}
              onPress={confirmWithdraw}
            >
              <Text style={[styles.menuFont, { marginBottom: 10 }]}>
                탈퇴하기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <StatusBar style="auto" />
      <SettingModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          fetchNickname();
          fetchProfileImage();
        }}
        nickname={nickname}
        setNickname={setNickname}
        setProfileImage={setProfileImage}
      />
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
  topTitleContainer: {
    width: "70%",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  myContainer: {
    width: "100%",
    height: 70,
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  myImg: {
    width: "25%",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: "5%",
  },
  myName: {
    width: "70%",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  mainContainer: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
  },
  backImg: {
    height: 44,
    width: 44,
    borderRadius: 22,
  },
  topFont: {
    fontSize: 20,
    textAlign: "center",
    justifyContent: "center",
  },
  menuBox: {
    width: "95%",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 12,
    backgroundColor: "#fff",
  },
  menuFont: {
    fontSize: 15,
  },
  menuFontBold: {
    fontSize: 16,
    fontWeight: "bold",
  },
  lineBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingTop: 16,
    marginHorizontal: 13,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  noneLineBox: {
    flexDirection: "row",
    marginHorizontal: 13,
    alignItems: "center",
    padding: 10,
  },
  switchLineBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  switchStyle: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
});
