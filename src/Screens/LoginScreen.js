import { StatusBar } from "expo-status-bar";
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

import IMAGES from "../../assets";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={IMAGES.LOGO} style={styles.logoImg} />
          <Text style={styles.logofont}>캠북스</Text>
        </View>

        <View style={styles.loginContainer}>
          <TextInput style={styles.input} placeholder="아이디" />
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.inputWithIcon}
              placeholder="비밀번호"
              secureTextEntry={!passwordVisible}
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
          <TouchableOpacity
            style={styles.mainbtn}
            onPress={() => navigation.navigate("RouteScreen")}
          >
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
          <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
            <Text style={styles.linkfont}>회원가입</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.guestContainer}></View>

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