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
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function ChangeAddr() {
  const navigation = useNavigation();

  // 더미 현재 주소 (읽기 전용)
  const dummyCurrentAddress = "서울특별시 강남구 역삼동 123-45";

  const [newAddress, setNewAddress] = useState("");

  const validateAddress = (addr) => {
    return addr.length >= 5; // 예시: 최소 5자 이상
  };

  const handleCompleteChange = () => {
    Alert.alert("주소 변경 완료", "주소가 성공적으로 변경되었습니다.", [
      {
        text: "확인",
        onPress: () => navigation.navigate("SettingPage"),
      },
    ]);
  };

  const isNewAddressValid = validateAddress(newAddress);

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
          <Text style={styles.topFont}>주소 변경</Text>
        </View>
        <View style={{ width: "15%" }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.contentContainer}
      >
        <View style={styles.inputSection}>
          <Text style={styles.currentAddressLabel}>현재 주소</Text>
          <View style={styles.currentAddressBox}>
            <Text style={styles.currentAddressText}>{dummyCurrentAddress}</Text>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="새 주소를 입력해주세요."
            value={newAddress}
            onChangeText={setNewAddress}
            autoCapitalize="none"
          />
          {!isNewAddressValid && newAddress.length > 0 && (
            <Text style={styles.errorText}>주소를 5자 이상 입력해주세요.</Text>
          )}
        </View>

        <View style={styles.bottomBtnContainer}>
          <TouchableOpacity
            style={[
              styles.completeBtn,
              isNewAddressValid
                ? { backgroundColor: "#67574D" }
                : { backgroundColor: "#BEBEBE" },
            ]}
            disabled={!isNewAddressValid}
            onPress={handleCompleteChange}
          >
            <Text style={styles.btnfont}>주소 변경</Text>
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
  currentAddressLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },
  currentAddressBox: {
    backgroundColor: "#F7F7F7",
    height: 48,
    borderRadius: 5,
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  currentAddressText: {
    fontSize: 16,
    color: "#333",
  },
  textInput: {
    backgroundColor: "#F7F7F7",
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginBottom: 12,
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
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
});
r