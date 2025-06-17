import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    SafeAreaView,
    ScrollView,
    TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // useNavigation 훅 추가
import { useState } from "react";
import IMAGES from "../../../assets";
import { Ionicons } from "@expo/vector-icons";

const ChatDetailPage = ({ route }) => {
    const { chat } = route.params; // route.params에서 채팅 데이터 가져오기
    const navigation = useNavigation(); // useNavigation 훅으로 navigation 객체 가져오기

    // 샘플 채팅 데이터 (상대방과 나의 메시지)
    const initialMessages = [
        {
            id: 1,
            sender: "other",
            message: "안녕하세요, 어떻게 도와드릴까요?",
            time: "오후 1:17",
        },
        {
            id: 2,
            sender: "myself",
            message: "안녕하세요! 제가 원하는 제품이 있나요?",
            time: "오후 1:18",
        },
        {
            id: 3,
            sender: "other",
            message: "네, 어떤 제품을 찾고 계신가요?",
            time: "오후 1:19",
        },
        { id: 4, sender: "myself", message: chat.message, time: chat.time },
    ];

    const [chatMessages, setChatMessages] = useState(initialMessages); // 메시지 상태
    const [message, setMessage] = useState(""); // 입력 메시지 상태

    const sendMessage = () => {
        if (message.trim()) {
            const newMessage = {
                id: chatMessages.length + 1, // ID는 기존 메시지 수 + 1로 설정
                sender: "myself",
                message: message,
                time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }), // 현재 시간
            };
            setChatMessages((prevMessages) => [...prevMessages, newMessage]); // 새로운 메시지 추가
            setMessage(""); // 입력창 초기화
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <SafeAreaView style={styles.container}>
                <View style={styles.topContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={28} color="#333" />
                    </TouchableOpacity>

                    <View style={styles.topTitleContainer}>
                        <Text style={styles.topFont}>{chat.name}</Text>
                    </View>
                    <View style={{ width: "15%" }}></View>
                </View>

                <View style={styles.chatContainer}>
                    {chatMessages.map((message) => (
                        <View
                            key={message.id}
                            style={[
                                styles.messageContainer,
                                message.sender === "myself"
                                    ? styles.myMessage
                                    : styles.otherMessage,
                            ]}
                        >
                            <Text style={styles.chatMessage}>{message.message}</Text>
                            <Text style={styles.chatTime}>{message.time}</Text>
                        </View>
                    ))}
                </View>

                {/* 입력창과 전송 버튼 추가 */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="  메시지를 입력하세요"
                        value={message}
                        onChangeText={setMessage} // 입력 내용 업데이트
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                        <Ionicons name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1, // ScrollView가 화면 전체를 차지하게 설정
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    topContainer: {
        width: "100%",
        height: "10%",
        paddingTop: 40,
        flexDirection: "row", // 이미지와 텍스트를 가로로 배치
    },
    topBtnContainer: {
        width: "15%",
    },
    topTitleContainer: {
        width: "70%",
    },
    backImg: {
        height: 44,
        width: 44,
        borderRadius: 22,
    },
    topFont: {
        fontSize: 20,
        marginTop: 5,
        textAlign: "center",
        justifyContent: "center",
    },
    chatContainer: {
        width: "100%",
        padding: 10,
        flex: 1, // Container가 남은 공간을 차지하도록 설정
    },
    messageContainer: {
        marginVertical: 5,
        padding: 10,
        borderRadius: 10,
        maxWidth: "75%", // 최대 너비 설정
    },
    myMessage: {
        backgroundColor: "#DDDDDD", // 내 메시지 배경색
        alignSelf: "flex-end", // 오른쪽 정렬
        borderTopLeftRadius: 10,
    },
    otherMessage: {
        backgroundColor: "#F3F3F3", // 상대방 메시지 배경색
        alignSelf: "flex-start", // 왼쪽 정렬
        borderTopRightRadius: 10,
    },
    chatMessage: {
        fontSize: 16,
        marginBottom: 5,
    },
    chatTime: {
        fontSize: 12,
        color: "gray",
        alignSelf: "flex-end", // 시간 텍스트 오른쪽 정렬
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        width: "100%",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        padding: 10,
        marginRight: 10,
    },
    sentImg: {
        height: 24,
        width: 24,
    },
    backButton: {
        paddingHorizontal: 10,
        justifyContent: "center",
        alignItems: "center",
    },

    sendButton: {
        backgroundColor: "#67574D",
        padding: 12,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default ChatDetailPage;