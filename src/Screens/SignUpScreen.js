import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";

export default function SignUpScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [idChecked, setIdChecked] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState("");

  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");
  const [passwordValidMessage, setPasswordValidMessage] = useState("");
  const [nameErrorMessage, setNameErrorMessage] = useState("");

  // 비밀번호 유효성 검사 함수
  const validatePassword = (pw) => {
    const regex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;
    return regex.test(pw);
  };

  const checkIdDuplicate = () => {
    if (userId.trim() === "" || userId === "test123") {
      setIdChecked(false);
      setIdCheckMessage("아이디가 중복되었습니다. 다시 확인해주세요.");
    } else {
      setIdChecked(true);
      setIdCheckMessage("");
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (!validatePassword(password)) {
      setPasswordMatchMessage(""); // 조건 안 맞으면 일치 메시지 안 보여줌
      return;
    }
    if (text === password && text.length > 0) {
      setPasswordMatchMessage("비밀번호가 일치합니다.");
    } else {
      setPasswordMatchMessage("비밀번호가 일치하지 않습니다.");
    }
  };

  useEffect(() => {
    // 비밀번호 유효성 검사 메시지 업데이트
    if (password.length === 0) {
      setPasswordValidMessage("");
    } else if (!validatePassword(password)) {
      setPasswordValidMessage(
        "비밀번호는 영문, 숫자, 특수문자 포함 8자 이상이어야 합니다."
      );
    } else {
      setPasswordValidMessage("");
    }

    // 비밀번호 일치 메시지 재검사
    if (confirmPassword.length > 0) {
      if (!validatePassword(password)) {
        setPasswordMatchMessage("");
      } else if (confirmPassword === password) {
        setPasswordMatchMessage("비밀번호가 일치합니다.");
      } else {
        setPasswordMatchMessage("비밀번호가 일치하지 않습니다.");
      }
    } else {
      setPasswordMatchMessage("");
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    if (name.trim() === "") {
      setNameErrorMessage("이름을 입력해주세요.");
    } else {
      setNameErrorMessage("");
    }
  }, [name]);

  const canProceed =
    name.trim() !== "" &&
    userId.trim() !== "" &&
    idChecked &&
    validatePassword(password) &&
    confirmPassword === password;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>최고의 거래를 할</Text>
          <Text style={styles.title}>준비가 되셨나요?</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="이름을 입력해주세요."
            value={name}
            onChangeText={setName}
          />
          {nameErrorMessage !== "" && (
            <Text style={styles.errorText}>{nameErrorMessage}</Text>
          )}

          <View style={styles.idRow}>
            <TextInput
              style={styles.idInput}
              placeholder="아이디를 입력해주세요."
              value={userId}
              onChangeText={(text) => {
                setUserId(text);
                setIdChecked(false);
                setIdCheckMessage("");
              }}
            />
            <TouchableOpacity
              style={[styles.checkButton, idChecked && styles.disabledButton]}
              onPress={checkIdDuplicate}
              disabled={idChecked}
            >
              <Text style={styles.btnfont}>
                {idChecked ? "확인 완료" : "중복 확인"}
              </Text>
            </TouchableOpacity>
          </View>

          {idCheckMessage !== "" && (
            <Text style={styles.errorText}>{idCheckMessage}</Text>
          )}

          {/* 비밀번호 입력 */}
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="비밀번호를 입력해주세요."
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          {passwordValidMessage !== "" && (
            <Text style={styles.errorText}>{passwordValidMessage}</Text>
          )}

          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="비밀번호를 다시 입력해주세요."
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          {passwordMatchMessage !== "" && (
            <Text
              style={
                passwordMatchMessage.includes("일치하지")
                  ? styles.errorText
                  : styles.successText
              }
            >
              {passwordMatchMessage}
            </Text>
          )}
        </View>

        {/* 다음 버튼 */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.mainButton, !canProceed && styles.disabledButton]}
            onPress={() => {
              if (canProceed) navigation.navigate("AuthenticationScreen");
            }}
            disabled={!canProceed}
          >
            <Text style={styles.btnfont}>다음</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  titleContainer: {
    marginTop: 40,
    marginBottom: 80,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "#F7F7F7",
    width: "100%",
    height: 48,
    borderRadius: 5,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  idInput: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    height: 48,
    borderRadius: 5,
    paddingHorizontal: 16,
  },
  checkButton: {
    backgroundColor: "#67574D",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: "#AAA",
  },
  btnfont: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 5,
    height: 48,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 10,
  },
  eyeIcon: {
    paddingHorizontal: 8,
  },
  notice: {
    color: "#888",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  successText: {
    color: "green",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  bottomContainer: {
    marginTop: 40,
    marginBottom: 30,
  },
  mainButton: {
    backgroundColor: "#67574D",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: "center",
  },
});