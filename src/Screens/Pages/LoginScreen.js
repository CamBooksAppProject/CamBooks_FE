import { StatusBar } from "expo-status-bar";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import IMAGES from "../../../assets";
import api from "../../api/axiosInstance";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState(""); // 아이디
  const [password, setPassword] = useState(""); // 비밀번호
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/cambooks/member/doLogin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: email, password }),
        }
      );

      if (!response.ok) {
        throw new Error("아이디 또는 비밀번호가 틀렸습니다.");
      }

      const data = await response.json();
      await AsyncStorage.setItem("accessToken", data.token);
      await AsyncStorage.setItem("userId", String(data.id));
      await AsyncStorage.setItem("univId", String(data.univId));
      // Vue와 동일하게: 이메일을 로컬에 저장해 채팅에서 즉시 사용
      try {
        const me = await api.get("/member/info");
        if (me?.data?.email) {
          await AsyncStorage.setItem("email", me.data.email);
        }
      } catch (e) {
        // 이메일 저장 실패는 치명적이지 않으니 무시하고 진행
        console.log("/member/info 호출 실패:", e?.message || e);
      }

      navigation.replace("RouteScreen"); // 로그인 성공 시 RouteScreen 이동
    } catch (error) {
      Alert.alert("로그인 실패", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={IMAGES.LOGO} style={styles.logoImg} />
          <Text style={styles.logofont}>캠북스</Text>
        </View>

        <View style={styles.loginContainer}>
          <TextInput
            style={styles.input}
            placeholder="아이디"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.inputWithIcon}
              placeholder="비밀번호"
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons
                name={passwordVisible ? "eye" : "eye-off"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.mainbtn} onPress={handleLogin}>
            <Text style={styles.btnfont}>로그인</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("FindId")}>
            <Text style={styles.linkfont}>아이디 찾기</Text>
          </TouchableOpacity>
          <Text style={styles.linkfont}>|</Text>
          <TouchableOpacity onPress={() => navigation.navigate("FindPw")}>
            <Text style={styles.linkfont}>비밀번호 찾기</Text>
          </TouchableOpacity>
          <Text style={styles.linkfont}>|</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AuthenticationScreen")}
          >
            <Text style={styles.linkfont}>회원가입</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: "100%",
    height: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImg: {
    marginTop: 150,
    width: 110,
    height: 110,
    resizeMode: "contain",
  },
  logofont: {
    fontSize: 30,
    color: "#67574D",
    fontWeight: "bold",
    padding: 5,
  },
  loginContainer: {
    width: "100%",
    height: "25%",
    alignItems: "center",
    justifyContent: "center",
  },
  linkContainer: {
    width: "100%",
    height: "8%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  linkfont: {
    fontSize: 13,
    color: "#808080",
    marginHorizontal: 10,
  },
  guestContainer: {
    width: "100%",
    height: "30%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 100,
  },
  input: {
    backgroundColor: "#F7F7F7",
    width: "80%",
    height: 45,
    marginVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  passwordInputContainer: {
    width: "80%",
    marginVertical: 5,
    position: "relative",
  },
  inputWithIcon: {
    backgroundColor: "#F7F7F7",
    width: "100%",
    height: 45,
    paddingHorizontal: 20,
    paddingRight: 40,
    borderRadius: 5,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 12,
  },
  mainbtn: {
    backgroundColor: "#67574D",
    width: "80%",
    marginVertical: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    cursor: "pointer",
  },
  btnfont: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  subbtn: {
    backgroundColor: "#C3C2C1",
    width: "80%",
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    cursor: "pointer",
  },
});
