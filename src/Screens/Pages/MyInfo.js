import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";

export default function MyInfo() {
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await api.get("/member/info");
                setUserInfo(response.data);
            } catch (error) {
                console.error("사용자 정보 오류:", error);
                Alert.alert("에러", "사용자 정보를 불러오지 못했습니다.");
                navigation.navigate("Login");
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    const renderInfoRow = (label, value) => (
        <View style={styles.infoRow} key={label}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value || "-"}</Text>
        </View>
    );

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
                    <Text style={styles.topFont}>내 정보</Text>
                </View>
                <View style={{ width: "15%" }}></View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#67574D" />
                </View>
            ) : (
                <View style={styles.infoContainer}>
                    {renderInfoRow("이름", userInfo?.name)}
                    {renderInfoRow("이메일", userInfo?.email)}
                    {renderInfoRow("학교", userInfo?.university)}
                    {renderInfoRow("주소", userInfo?.address)}
                </View>
            )}

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
    infoContainer: {
        marginTop: 30,
        paddingHorizontal: 24,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    label: {
        fontSize: 16,
        color: "#666",
    },
    value: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
