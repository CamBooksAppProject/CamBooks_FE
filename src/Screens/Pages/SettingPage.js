import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Switch } from "react-native-gesture-handler";
import { useState } from "react";
import SettingModal from "./SettingModal.js";

import IMAGES from "../../../assets";
import { Ionicons } from "@expo/vector-icons";

export default function SettingPage() {
  const navigation = useNavigation();

  const [isChatEnabled, setIsChatEnabled] = useState(false);
  const [isCommunityEnabled, setIsCommunityEnabled] = useState(false);

  const [nickname, setNickname] = useState("어서옵쇼");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(IMAGES.LOGO);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 고정 */}
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

      {/* 프로필 및 설정 내용 스크롤 */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.myContainer}>
          <View style={styles.myImg}>
            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              <Image source={profileImage} style={styles.backImg} />
            </TouchableOpacity>
          </View>

          <View style={styles.myName}>
            <Text style={[{ fontSize: 16 }]}>{nickname} 님</Text>
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

            <TouchableOpacity
              style={styles.noneLineBox}
              onPress={() => navigation.navigate("LoginScreen")}
            >
              <Text style={styles.menuFont}>로그아웃</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.noneLineBox}>
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
        onClose={() => setIsModalVisible(false)}
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
    justifyContent: "flex-start", // 상단 고정을 위해 flex-start로 변경
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
    marginTop: 0,
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
