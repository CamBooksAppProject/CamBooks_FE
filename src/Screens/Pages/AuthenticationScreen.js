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

export default function AuthenticationScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);

  const isValidEmail = (email) => {
    const trimmed = email.trim();
    return trimmed.includes("@") && trimmed.endsWith(".ac.kr");
  };

  const handleSendCode = async () => {
    if (!isValidEmail(email)) {
      setErrorMessage(
        "학교 이메일 형식을 확인해주세요. '.ac.kr'로 끝나야 합니다."
      );
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/cambooks/email/send-code?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "POST",
        }
      );

      const text = await response.text();

      if (response.ok && text.includes("인증 코드가 전송되었습니다")) {
        Alert.alert("📩", "인증번호가 이메일로 전송되었습니다.");
        setErrorMessage("");
      } else {
        setErrorMessage(`전송 실패: ${text}`);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("서버 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleConfirm = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/cambooks/email/verify-code?email=${encodeURIComponent(
          email
        )}&code=${inputCode}`,
        {
          method: "POST",
        }
      );

      const text = await response.text();
      if (response.ok && text === "인증 성공") {
        setIsCodeConfirmed(true);
        setErrorMessage("");
        Alert.alert("이메일 인증 성공", "이메일 인증에 성공했습니다.");
      } else {
        setIsCodeConfirmed(false);
        setErrorMessage("인증번호가 일치하지 않습니다.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("서버 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleCompleteSignup = () => {
    navigation.navigate("SignUpScreen");
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
          <Text style={styles.title}>학교 이메일 인증이</Text>
          <Text style={styles.title}>필요해요.</Text>
        </View>

        <View style={styles.InputContainer}>
          <TextInput
            style={styles.input}
            placeholder="학교 이메일을 입력해주세요."
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

          <TouchableOpacity style={styles.mainbtn} onPress={handleSendCode}>
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
                setIsCodeConfirmed(false);
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

          <TouchableOpacity
            style={[
              styles.completeBtn,
              isCodeConfirmed && email
                ? { backgroundColor: "#67574D" }
                : { backgroundColor: "#BEBEBE" },
            ]}
            onPress={handleCompleteSignup}
            disabled={!isCodeConfirmed || !email}
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
  textContainer: {
    marginTop: 40,
    marginBottom: 80,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
  },
  InputContainer: {
    width: "100%",
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
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 40,
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
  btnfont: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
  completeBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 30,
  },
});
