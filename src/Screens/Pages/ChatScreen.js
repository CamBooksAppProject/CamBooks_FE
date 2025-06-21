import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function ChatScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState(0);

    const tabs = [
        { id: 0, title: "전체" },
        { id: 1, title: "판매" },
        { id: 2, title: "구매" },
    ];

    const chatData = [
        {
            id: 1,
            name: "연심이",
            message: "문의드리려고 연락드렸습니다.",
            time: "오후 1:17",
            type: "구매",
        },
        {
            id: 2,
            name: "서누",
            message: "전공책 맞을까요?",
            time: "오전 11:56",
            type: "판매",
        },
        {
            id: 3,
            name: "정코미",
            message: "내일 연락드릴게요!",
            time: "어제",
            type: "구매",
        },
        { id: 4, name: "초코", message: "넹", time: "3일전", type: "판매" },
    ];

    const renderChatItem = (item) => (
        <TouchableOpacity
            style={styles.rowContainer}
            key={item.id}
            onPress={() => navigation.navigate("ChatDetailPage", { chat: item })}
        >
            <MaterialIcons
                name="person"
                size={50}
                color="#67574D"
                style={{ marginRight: 10 }}
            />
            <View style={styles.textContainer}>
                <View style={styles.nameTimeContainer}>
                    <Text style={styles.nameText}>{item.name}</Text>
                    <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <Text style={styles.chatMessage}>{item.message}</Text>
            </View>
        </TouchableOpacity>
    );

    const filteredChatData = chatData.filter((chat) => {
        if (activeTab === 0) return true;
        if (activeTab === 1 && chat.type === "판매") return true;
        if (activeTab === 2 && chat.type === "구매") return true;
        return false;
    });

    return (
        <SafeAreaView style={styles.container}>
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

            <View style={styles.mainContainer}>
                {filteredChatData.map(renderChatItem)}
            </View>

            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    tabContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 5,
    },
    tabButton: {
        width: 65,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#67574D",
        borderRadius: 20,
        marginHorizontal: 5,
    },
    activeTab: {
        backgroundColor: "#67574D",
    },
    inactiveTab: {
        backgroundColor: "#ffffff",
    },
    tabText: {
        fontWeight: "500",
    },
    activeText: {
        color: "#ffffff",
    },
    inactiveText: {
        color: "#000000",
    },
    mainContainer: {
        width: "100%",
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    rowContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 8,
    },
    textContainer: {
        flex: 1,
    },
    nameTimeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    nameText: {
        fontWeight: "bold",
    },
    timeText: {
        color: "gray",
    },
    chatMessage: {
        color: "#555555",
    },
});