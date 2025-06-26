import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/axiosInstance";

export default function ChangePw() {
  const navigation = useNavigation();

  const [step, setStep] = useState(1); // 1: 현재 비밀번호 확인, 2: 새 비밀번호 입력

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [passwordValidMessage, setPasswordValidMessage] = useState("");

  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const validateNewPassword = (pw) => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~\-]).{8,}$/;
    return regex.test(pw);
  };

  useEffect(() => {
    if (newPw.length === 0) {
      setPasswordValidMessage("");
    } else if (!validateNewPassword(newPw)) {
      setPasswordValidMessage(
        "비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다."
      );
    } else {
      setPasswordValidMessage("");
    }
  }, [newPw]);

  const checkCurrentPassword = async () => {
    try {
      const response = await api.post("/member/check-password", {
        password: currentPw,
      });

      if (response.status === 200) {
        setStep(2);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage("현재 비밀번호가 올바르지 않습니다.");
      } else {
        Alert.alert("오류", "비밀번호 확인 중 오류가 발생했습니다.");
      }
    }
  };

  const updateNewPassword = async () => {
    try {
      const response = await api.post("/member/update-password", {
        password: newPw,
      });

      if (response.status === 200) {
        Alert.alert("완료", "비밀번호가 성공적으로 변경되었습니다.", [
          { text: "확인", onPress: () => navigation.navigate("SettingPage") },
        ]);
      }
    } catch (error) {
      Alert.alert("오류", "비밀번호 변경 중 문제가 발생했습니다.");
    }
  };

  const isNewPwValid =
    newPw.length > 0 &&
    newPw === confirmPw &&
    validateNewPassword(newPw) &&
    confirmPw.length > 0;

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
          <Text style={styles.topFont}>비밀번호 변경</Text>
        </View>
        <View style={{ width: "15%" }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.contentContainer}
      >
        <View style={styles.inputSection}>
          {/* 현재 비밀번호 입력 */}
          {step === 1 && (
            <>
              <TextInput
                style={styles.currentPwInput}
                placeholder="현재 비밀번호를 입력해주세요."
                value={currentPw}
                onChangeText={(text) => {
                  setCurrentPw(text);
                  setErrorMessage("");
                }}
                secureTextEntry
                autoCapitalize="none"
              />
              {errorMessage !== "" && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}
            </>
          )}

          {/* 새 비밀번호 입력 */}
          {step === 2 && (
            <>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="새로운 비밀번호를 입력해주세요."
                  value={newPw}
                  onChangeText={(text) => {
                    setNewPw(text);
                    setErrorMessage("");
                  }}
                  secureTextEntry={!showNewPw}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowNewPw(!showNewPw)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showNewPw ? "eye-off" : "eye"}
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
                  placeholder="새로운 비밀번호를 다시 입력해주세요."
                  value={confirmPw}
                  onChangeText={(text) => {
                    setConfirmPw(text);
                    setErrorMessage("");
                  }}
                  secureTextEntry={!showConfirmPw}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPw(!showConfirmPw)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPw ? "eye-off" : "eye"}
                    size={20}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
              {newPw !== confirmPw && confirmPw.length > 0 && (
                <Text style={styles.errorText}>
                  비밀번호가 일치하지 않습니다.
                </Text>
              )}
            </>
          )}
        </View>

        {/* 버튼 */}
        <View style={styles.bottomBtnContainer}>
          <TouchableOpacity
            style={[
              styles.completeBtn,
              (step === 1 && currentPw) || (step === 2 && isNewPwValid)
                ? { backgroundColor: "#67574D" }
                : { backgroundColor: "#BEBEBE" },
            ]}
            disabled={
              (step === 1 && currentPw.length === 0) ||
              (step === 2 && !isNewPwValid)
            }
            onPress={step === 1 ? checkCurrentPassword : updateNewPassword}
          >
            <Text style={styles.btnfont}>
              {step === 1 ? "비밀번호 확인" : "비밀번호 변경"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <StatusBar style="auto" />
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
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  topBtnContainer: {
    width: "15%",
    justifyContent: "center",
    alignItems: "flex-start",
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
    fontWeight: "bold",
    textAlign: "center",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 80,
    justifyContent: "space-between",
  },
  inputSection: {},
  currentPwInput: {
    backgroundColor: "#F7F7F7",
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginBottom: 12,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#F7F7F7",
    borderRadius: 5,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    height: "100%",
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  bottomBtnContainer: {
    position: "absolute",
    bottom: 20,
    left: 24,
    right: 24,
  },
  completeBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: "center",
  },
  btnfont: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
