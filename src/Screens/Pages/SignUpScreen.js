import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";

const universityList = [
  { id: 1, name: "서울대학교" },
  { id: 2, name: "강남대학교" },
  { id: 3, name: "고려대학교" },
  { id: 4, name: "연세대학교" },
  { id: 5, name: "성균관대학교" },
  { id: 6, name: "한국외국어대학교" },
  { id: 7, name: "한양대학교" },
  { id: 8, name: "중앙대학교" },
  { id: 9, name: "경희대학교" },
  { id: 10, name: "이화여자대학교" },
  { id: 11, name: "동국대학교" },
  { id: 12, name: "인천대학교" },
  { id: 13, name: "서울시립대학교" },
  { id: 14, name: "서강대학교" },
  { id: 15, name: "포항공과대학교" },
  { id: 16, name: "한국과학기술원" },
  { id: 17, name: "광주과학기술원" },
  { id: 18, name: "울산과학기술원" },
  { id: 19, name: "경북대학교" },
  { id: 20, name: "부산대학교" },
  { id: 21, name: "경상국립대학교" },
  { id: 22, name: "충북대학교" },
  { id: 23, name: "전북대학교" },
  { id: 24, name: "충남대학교" },
  { id: 25, name: "전남대학교" },
  { id: 26, name: "중앙대학교" },
  { id: 27, name: "국민대학교" },
  { id: 28, name: "명지대학교" },
  { id: 29, name: "서울과학기술대학교" },
  { id: 30, name: "세종대학교" },
  { id: 31, name: "한국기술교육대학교" },
  { id: 32, name: "한국예술종합학교" },
];

const universityItems = universityList.map((u) => ({
  label: u.name,
  value: u.id,
}));

export default function SignUpScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [email, setEmail] = useState(route.params?.email || "");
  const [name, setName] = useState("");

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [universityOpen, setUniversityOpen] = useState(false);
  const [universityValue, setUniversityValue] = useState(
    universityItems.length > 0 ? universityItems[0].value : null
  );
  const [universityItemsState, setUniversityItemsState] =
    useState(universityItems);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [idChecked, setIdChecked] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState("");

  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");
  const [passwordValidMessage, setPasswordValidMessage] = useState("");
  const [nameErrorMessage, setNameErrorMessage] = useState("");

  const [nickname, setNickname] = useState("");
  const [address, setAddress] = useState("");

  const validatePassword = (pw) => {
    const regex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;
    return regex.test(pw);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const checkIdDuplicate = async () => {
    if (userId.trim() === "") {
      setIdChecked(false);
      setIdCheckMessage("아이디를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/cambooks/member/check-id",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ memberId: userId }),
        }
      );

      if (response.status === 200) {
        // 중복 없음 (사용 가능)
        setIdChecked(true);
        setIdCheckMessage("");
        Alert.alert("사용 가능한 아이디입니다.");
      } else if (response.status === 409) {
        // 중복됨
        setIdChecked(false);
        setIdCheckMessage("이미 사용 중인 아이디입니다.");
      } else {
        // 기타 오류
        setIdChecked(false);
        setIdCheckMessage("아이디 확인 중 오류가 발생했습니다.");
      }
    } catch (error) {
      setIdChecked(false);
      setIdCheckMessage("서버와 통신 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (!validatePassword(password)) {
      setPasswordMatchMessage("");
      return;
    }
    if (text === password && text.length > 0) {
      setPasswordMatchMessage("비밀번호가 일치합니다.");
    } else {
      setPasswordMatchMessage("비밀번호가 일치하지 않습니다.");
    }
  };

  useEffect(() => {
    if (password.length === 0) {
      setPasswordValidMessage("");
    } else if (!validatePassword(password)) {
      setPasswordValidMessage(
        "비밀번호는 영문, 숫자, 특수문자 포함 8자 이상이어야 합니다."
      );
    } else {
      setPasswordValidMessage("");
    }

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
    isValidEmail(email) &&
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

        <ScrollView
          style={styles.inputContainer}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={[styles.input, { marginBottom: 15 }]}
            placeholder="이름을 입력해주세요."
            value={name}
            onChangeText={setName}
          />
          {nameErrorMessage !== "" && (
            <Text style={styles.errorText}>{nameErrorMessage}</Text>
          )}

          <TextInput
            style={[styles.input, { marginBottom: 15 }]}
            placeholder="학교 이메일을 입력해주세요."
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* nickname 입력창 추가 */}
          <TextInput
            style={[styles.input, { marginBottom: 15 }]}
            placeholder="닉네임을 입력해주세요."
            value={nickname}
            onChangeText={setNickname}
          />

          {/* address 입력창 추가 */}
          <TextInput
            style={[styles.input, { marginBottom: 15 }]}
            placeholder="주소를 입력해주세요."
            value={address}
            onChangeText={setAddress}
          />

          <DropDownPicker
            open={universityOpen}
            value={universityValue}
            items={universityItemsState}
            setOpen={setUniversityOpen}
            setValue={setUniversityValue}
            setItems={setUniversityItemsState}
            style={[styles.dropdown, { marginBottom: 15 }]}
            dropDownContainerStyle={styles.dropdownContainer}
            listMode="MODAL"
            modalTitle="대학교 선택"
            modalProps={{
              animationType: "slide",
            }}
          />

          <View style={[styles.idRow, { marginBottom: 15 }]}>
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

          <View style={[styles.passwordRow, { marginBottom: 15 }]}>
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
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          {passwordValidMessage !== "" && (
            <Text style={styles.errorText}>{passwordValidMessage}</Text>
          )}

          <View style={[styles.passwordRow, { marginBottom: 15 }]}>
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
                name={showConfirmPassword ? "eye" : "eye-off"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          {passwordMatchMessage !== "" && (
            <Text
              style={[
                styles.errorText,
                passwordMatchMessage === "비밀번호가 일치합니다."
                  ? { color: "green" }
                  : { color: "red" },
              ]}
            >
              {passwordMatchMessage}
            </Text>
          )}
        </ScrollView>
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.mainButton, !canProceed && styles.disabledButton]}
            onPress={async () => {
              if (canProceed) {
                try {
                  const response = await fetch(
                    "http://localhost:8080/cambooks/member/create",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        name: name,
                        nickname: nickname,
                        email: email,
                        memberId: userId,
                        password: password,
                        universityId: universityValue,
                        address: address,
                      }),
                    }
                  );

                  const responseText = await response.text();

                  if (response.ok) {
                    console.log("회원가입 성공:", responseText);
                    Alert.alert(
                      "회원가입 완료",
                      `${responseText}님, 환영합니다!`,
                      [
                        {
                          text: "확인",
                          onPress: () => navigation.navigate("LoginScreen"),
                        },
                      ]
                    );
                  } else {
                    console.log(
                      "회원가입 실패, 상태 코드:",
                      response.status,
                      "응답:",
                      responseText
                    );
                    if (response.status === 401) {
                      console.log("401 발생! 요청 payload:", {
                        name, nickname, email, userId, password, universityValue, address
                      });
                      console.log("응답 headers:", [...response.headers.entries()]);
                      console.log("응답 body:", responseText);
                      Alert.alert("회원가입 실패", "이미 가입된 이메일이거나 인증 문제가 있습니다.");
                    } else if (response.status === 409) {
                      Alert.alert("회원가입 실패", "중복된 정보가 있습니다.");
                    } else {
                      Alert.alert(
                        "회원가입 실패",
                        `서버 응답: ${responseText}`
                      );
                    }
                  }
                } catch (error) {
                  console.error("회원가입 중 오류 발생:", error);
                  Alert.alert("오류", "회원가입 중 문제가 발생했습니다.");
                }
              }
            }}
            disabled={!canProceed}
          >
            <Text style={styles.btnfont}>회원가입완료</Text>
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
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 20,
  },
  titleContainer: {
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
  },
  inputContainer: {
    marginTop: 30,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  dropdown: {
    borderColor: "#ddd",
    borderRadius: 6,
  },
  dropdownContainer: {
    borderColor: "#ddd",
    borderRadius: 6,
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  idInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  checkButton: {
    backgroundColor: "#67574D",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 6,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#888",
  },
  btnfont: {
    color: "white",
    fontWeight: "bold",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 10,
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
  signUpButton: {
    backgroundColor: "#67574D",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    marginTop: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  bottomContainer: {
    marginTop: 20,
  },
  mainButton: {
    backgroundColor: "#67574D",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
});
