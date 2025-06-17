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

export default function ChangePw() {
    const navigation = useNavigation();

    // 더미 현재 비밀번호
    const dummyCurrentPw = "password123";

    const [currentPw, setCurrentPw] = useState("");
    const [isCurrentPwCorrect, setIsCurrentPwCorrect] = useState(false);

    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    // 새 비밀번호 보이기 토글 상태
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    // 새 비밀번호 유효성 메시지
    const [passwordValidMessage, setPasswordValidMessage] = useState("");

    // 현재 비밀번호 확인
    const handleCheckCurrentPw = () => {
        if (currentPw === dummyCurrentPw) {
            setIsCurrentPwCorrect(true);
            setErrorMessage("");
        } else {
            setErrorMessage("현재 비밀번호가 일치하지 않습니다.");
            setIsCurrentPwCorrect(false);
            setNewPw("");
            setConfirmPw("");
            setPasswordValidMessage("");
        }
    };

    // 새 비밀번호 유효성 검사 함수
    const validateNewPassword = (pw) => {
        // 8자 이상, 영문 대소문자, 숫자, 특수문자 포함
        const regex =
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-]).{8,}$/;
        return regex.test(pw);
    };

    // 새 비밀번호 변경 시 유효성 메시지 업데이트
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

    // 비밀번호 변경 완료
    const handleCompleteChange = () => {
        Alert.alert("비밀번호 변경 완료", "비밀번호가 성공적으로 변경되었습니다.", [
            {
                text: "확인",
                onPress: () => navigation.navigate("SettingPage"),
            },
        ]);
    };

    // 새 비밀번호와 확인 비밀번호가 일치하고 유효한지
    const isNewPwValid =
        newPw.length > 0 &&
        newPw === confirmPw &&
        validateNewPassword(newPw) &&
        confirmPw.length > 0;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* 상단바 */}
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
                <View style={{ width: "15%" }}></View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.contentContainer}
            >
                <View style={styles.inputSection}>
                    {/* 현재 비밀번호 입력 + 확인 버튼 한 줄 */}
                    <View style={styles.currentPwRow}>
                        <TextInput
                            style={styles.currentPwInput}
                            placeholder="현재 비밀번호를 입력해주세요."
                            value={currentPw}
                            onChangeText={(text) => {
                                setCurrentPw(text);
                                setErrorMessage("");
                                setIsCurrentPwCorrect(false);
                                setNewPw("");
                                setConfirmPw("");
                                setPasswordValidMessage("");
                            }}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={[
                                styles.checkBtn,
                                currentPw.length > 0
                                    ? { backgroundColor: "#67574D" }
                                    : { backgroundColor: "#BEBEBE" },
                            ]}
                            onPress={handleCheckCurrentPw}
                            disabled={currentPw.length === 0}
                        >
                            <Text style={styles.btnfont}>확인</Text>
                        </TouchableOpacity>
                    </View>

                    {errorMessage !== "" && (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    )}

                    {/* 현재 비밀번호 맞으면 새 비밀번호 입력 보여주기 */}
                    {isCurrentPwCorrect && (
                        <>
                            {/* 새 비밀번호 */}
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

                            {/* 새 비밀번호 확인 */}
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

                {/* 비밀번호 변경 버튼 - 화면 하단 고정 */}
                <View style={styles.bottomBtnContainer}>
                    <TouchableOpacity
                        style={[
                            styles.completeBtn,
                            isNewPwValid
                                ? { backgroundColor: "#67574D" }
                                : { backgroundColor: "#BEBEBE" },
                        ]}
                        disabled={!isNewPwValid}
                        onPress={handleCompleteChange}
                    >
                        <Text style={styles.btnfont}>비밀번호 변경</Text>
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
        paddingTop: 80, // 상단바 아래 여백
        paddingBottom: 80, // 하단 버튼 공간 확보
        justifyContent: "space-between",
    },
    inputSection: {},
    // 현재 비밀번호 + 확인 버튼 한 줄 스타일
    currentPwRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    currentPwInput: {
        flex: 1,
        backgroundColor: "#F7F7F7",
        height: 48,
        paddingHorizontal: 16,
        borderRadius: 5,
    },
    checkBtn: {
        marginLeft: 8,
        paddingHorizontal: 16,
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
    // 새 비밀번호 입력 + eye 아이콘 한 줄 스타일
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
});