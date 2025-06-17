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

export default function FindId() {
    const navigation = useNavigation();
    const [schoolName, setSchoolName] = useState("");
    const [email, setEmail] = useState("");
    const [inputCode, setInputCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [sentCode, setSentCode] = useState("");
    const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);

    const correctCode = "123456";

    const isValidEmail = (email) => {
        const trimmed = email.trim();
        return trimmed.includes("@") && trimmed.endsWith(".ac.kr");
    };

    const handleSendCode = () => {
        if (!isValidEmail(email)) {
            setErrorMessage("학교 이메일은 '@'를 포함하고 '.ac.kr'로 끝나야 합니다.");
            setSentCode("");
            return;
        }
        setErrorMessage("");
        setSentCode(correctCode);
        setIsCodeConfirmed(false);
        Alert.alert("", "인증번호가 전송되었습니다.");
    };

    const handleConfirm = () => {
        if (inputCode !== correctCode) {
            setErrorMessage("인증번호가 다릅니다.");
            setIsCodeConfirmed(false);
            return;
        }
        setErrorMessage("");
        setIsCodeConfirmed(true);
    };

    const handleCompleteSignup = () => {
        Alert.alert("아이디 찾기 완료", "아이디찾기가 완료되었습니다.", [
            {
                text: "확인",
                onPress: () => navigation.navigate("LoginScreen"),
            },
        ]);
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
                    <Text style={styles.title}>아이디 찾기</Text>
                </View>

                <View style={styles.InputContainer}>
                    <TextInput
                        style={styles.schoolInput}
                        placeholder="학교 이름을 입력해주세요."
                        value={schoolName}
                        onChangeText={(text) => setSchoolName(text)}
                        autoCapitalize="words"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="학교이메일을 입력해주세요."
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setErrorMessage("");
                            setSentCode("");
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

                    {sentCode !== "" && (
                        <Text style={styles.sentCodeText}>
                            테스트용 인증번호: {sentCode}
                        </Text>
                    )}

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
                            isCodeConfirmed && email && schoolName
                                ? { backgroundColor: "#67574D" }
                                : { backgroundColor: "#BEBEBE" },
                        ]}
                        onPress={handleCompleteSignup}
                        disabled={!isCodeConfirmed || !email || !schoolName}
                    >
                        <Text style={styles.btnfont}>아이디 찾기</Text>
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
    sentCodeText: {
        marginTop: 5,
        fontSize: 13,
        color: "#333",
        textAlign: "center",
    },
    completeBtn: {
        width: "100%",
        paddingVertical: 14,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 30,
    },
});