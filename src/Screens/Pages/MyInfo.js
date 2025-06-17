import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function MyInfo() {
    const navigation = useNavigation();

    const userInfo = [
        { label: "이름", value: "안정빈" },
        { label: "아이디", value: "komi123" },
        { label: "이메일", value: "jungb1203@kangnam.ac.kr" },
        { label: "학교", value: "강남대학교" },
        { label: "주소", value: "용인시 기흥구 구갈동" },
    ];

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
                    <Text style={styles.topFont}>내 정보</Text>
                </View>
                <View style={{ width: "15%" }}></View>
            </View>

            {/* 사용자 정보 리스트 */}
            <View style={styles.infoContainer}>
                {userInfo.map(({ label, value }) => (
                    <View key={label} style={styles.infoRow}>
                        <Text style={styles.label}>{label}</Text>
                        <Text style={styles.value}>{value}</Text>
                    </View>
                ))}
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
});