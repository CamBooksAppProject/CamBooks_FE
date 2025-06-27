import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/axiosInstance";

export default function FindPw() {
  const navigation = useNavigation();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);
  const [isSendCodeDisabled, setIsSendCodeDisabled] = useState(false);

  const isValidEmail = (email) =>
    email.includes("@") && email.trim().endsWith(".ac.kr");

  const handleSendCode = async () => {
    if (!userId || !email) {
      setErrorMessage("아이디와 이메일을 모두 입력해주세요.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("학교 이메일은 '@' 포함 및 '.ac.kr'로 끝나야 합니다.");
      return;
    }

    try {
      setIsSendCodeDisabled(true);
      await api.post("/member/find-password/send", {
        memberId: userId,
        email: email,
      });

      Alert.alert(
        "인증번호 전송",
        "입력하신 이메일로 인증번호가 전송되었습니다."
      );
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("인증번호 전송에 실패했습니다.");
      setIsSendCodeDisabled(false);
    }
  };

  const handleConfirm = async () => {
    try {
      const response = await api.post(
        `/member/find-password/verified?email=${encodeURIComponent(
          email
        )}&code=${inputCode}`
      );

      if (response.data === true) {
        setIsCodeConfirmed(true);
        setErrorMessage("");
        Alert.alert("인증 성공", "이메일 인증이 완료되었습니다.");
      } else {
        throw new Error("인증 실패");
      }
    } catch (error) {
      setIsCodeConfirmed(false);
      setErrorMessage("인증번호가 잘못되었거나 만료되었습니다.");
      console.error("[Code Verification Error]", error);
    }
  };

  const handleCompleteReset = async () => {
    if (!newPassword) {
      setErrorMessage("새 비밀번호를 입력해주세요.");
      return;
    }

    try {
      await api.post("/member/find-password/new-password", {
        email: email,
        newPassword: newPassword,
      });

      Alert.alert("성공", "비밀번호가 재설정되었습니다.", [
        { text: "확인", onPress: () => navigation.navigate("LoginScreen") },
      ]);
    } catch (error) {
      setErrorMessage("비밀번호 재설정에 실패했습니다.");
      console.error("[Password Reset Error]", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>

        <View style={styles.textContainer}>
          <Text style={styles.title}>비밀번호 찾기</Text>
        </View>

        <View style={styles.InputContainer}>
          <TextInput
            style={styles.schoolInput}
            placeholder="아이디를 입력해주세요."
            value={userId}
            onChangeText={(text) => setUserId(text)}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="학교이메일을 입력해주세요."
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrorMessage("");
              setIsCodeConfirmed(false);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {errorMessage !== "" && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <TouchableOpacity
            style={[
              styles.mainbtn,
              isSendCodeDisabled && { backgroundColor: "#BEBEBE" },
            ]}
            onPress={handleSendCode}
            disabled={isSendCodeDisabled}
          >
            <Text style={styles.btnfont}>인증번호 전송</Text>
          </TouchableOpacity>

          <View style={styles.ckContainer}>
            <TextInput
              style={styles.ckInput}
              placeholder="인증번호를 입력해주세요."
              value={inputCode}
              onChangeText={(text) => {
                setInputCode(text);
                setErrorMessage("");
              }}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={[
                styles.smallbtn,
                inputCode.length === 6
                  ? { backgroundColor: "#67574D" }
                  : { backgroundColor: "#BEBEBE" },
              ]}
              onPress={handleConfirm}
              disabled={inputCode.length !== 6}
            >
              <Text style={styles.btnfont}>확인</Text>
            </TouchableOpacity>
          </View>

          {isCodeConfirmed && (
            <>
              <TextInput
                style={styles.input}
                placeholder="새 비밀번호를 입력해주세요."
                value={newPassword}
                secureTextEntry
                onChangeText={(text) => setNewPassword(text)}
              />
              <TouchableOpacity
                style={[
                  styles.completeBtn,
                  newPassword
                    ? { backgroundColor: "#67574D" }
                    : { backgroundColor: "#BEBEBE" },
                ]}
                onPress={handleCompleteReset}
                disabled={!newPassword}
              >
                <Text style={styles.btnfont}>비밀번호 재설정하기</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  backButton: { marginBottom: 20 },
  textContainer: { marginTop: 40, marginBottom: 80 },
  title: { fontSize: 25, fontWeight: "bold", color: "#000" },
  InputContainer: { width: "100%" },
  schoolInput: {
    backgroundColor: "#F7F7F7",
    width: "100%",
    height: 48,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  input: {
    backgroundColor: "#F7F7F7",
    width: "100%",
    height: 48,
    marginVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  ckContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  ckInput: {
    backgroundColor: "#F7F7F7",
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  mainbtn: {
    backgroundColor: "#67574D",
    width: "100%",
    marginVertical: 15,
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: "center",
  },
  smallbtn: {
    marginLeft: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  btnfont: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  errorText: { color: "red", fontSize: 12, marginTop: 8, marginLeft: 4 },
  completeBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 30,
  },
});
