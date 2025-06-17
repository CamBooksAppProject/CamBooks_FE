import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView,
    FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function MyPost() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState(0);

    const tabs = [
        { id: 0, title: "커뮤니티" },
        { id: 1, title: "자유게시판" },
        { id: 2, title: "댓글" },
    ];

    // 더미 데이터 예시
    const communityPosts = [
        { id: "c1", title: "커뮤니티 글 1", date: "2025-06-15" },
        { id: "c2", title: "커뮤니티 글 2", date: "2025-06-14" },
    ];

    const freeBoardPosts = [
        { id: "f1", title: "자유게시판 글 1", date: "2025-06-13" },
        { id: "f2", title: "자유게시판 글 2", date: "2025-06-12" },
    ];

    const comments = [
        { id: "cm1", content: "댓글 내용 1", date: "2025-06-11" },
        { id: "cm2", content: "댓글 내용 2", date: "2025-06-10" },
    ];

    // 각 탭에 따른 데이터 선택
    const getDataByTab = () => {
        if (activeTab === 0) return communityPosts;
        if (activeTab === 1) return freeBoardPosts;
        if (activeTab === 2) return comments;
        return [];
    };

    // 아이템 렌더링 함수
    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity style={styles.itemContainer}>
                <View style={{ flex: 1 }}>
                    {activeTab === 2 ? (
                        <Text style={styles.itemText}>{item.content}</Text>
                    ) : (
                        <Text style={styles.itemText}>{item.title}</Text>
                    )}
                    <Text style={styles.dateText}>{item.date}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
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
                    <Text style={styles.topFont}>내 글 관리</Text>
                </View>
                <View style={{ width: "15%" }}></View>
            </View>

            {/* 탭 */}
            <View style={styles.tabContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tabButton,
                            activeTab === tab.id ? styles.activeTab : styles.inactiveTab,
                        ]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab.id ? styles.activeText : styles.inactiveText,
                            ]}
                        >
                            {tab.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 글, 댓글 리스트 */}
            <FlatList
                data={getDataByTab()}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
            />

            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
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
    tabContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 10,
    },
    tabButton: {
        width: 85,
        height: 34,
        marginTop: 15,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#67574D",
        borderRadius: 20,
        marginHorizontal: 6,
    },
    activeTab: {
        backgroundColor: "#67574D",
    },
    inactiveTab: {
        backgroundColor: "#fff",
    },
    tabText: {
        fontWeight: "500",
    },
    activeText: {
        color: "#fff",
    },
    inactiveText: {
        color: "#000",
    },
    itemContainer: {
        backgroundColor: "#f9f7f3",
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
    },
    itemText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    dateText: {
        marginTop: 6,
        fontSize: 12,
        color: "#888",
    },
});