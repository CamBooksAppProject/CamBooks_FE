import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function NoticePage() {
    const navigation = useNavigation();
    const [expandedIndex, setExpandedIndex] = useState(null);

    const faqData = [
        {
            question: "학교 인증이 안돼요!",
            answer: "학교 이메일 주소가 .ac.kr로 끝나는지 다시 확인해보세요.",
        },
        {
            question: "글이 삭제되면 스크랩한 글도 지워지나요?",
            answer:
                "글이 삭제되면 스크랩한 글도 함께 삭제되어 더 이상 확인할 수 없습니다.",
        },
        {
            question: "스크랩 취소는 어떻게 하나요?",
            answer: "내 스크랩 목록에서 해당 게시글을 다시 눌러 취소할 수 있습니다.",
        },
        {
            question: "비밀번호를 잊어버렸어요.",
            answer: "로그인 화면에서 '비밀번호 찾기'를 눌러 재설정할 수 있습니다.",
        },
        {
            question: "로그아웃은 어디서 하나요?",
            answer: "프로필 화면 하단에서 로그아웃을 선택하시면 됩니다.",
        },
        {
            question: "채팅방 어떻게 만드나요?",
            answer:
                "원하는 게시글에서 '채팅하기' 버튼을 눌러 상대방과 채팅방을 생성할 수 있습니다.",
        },
        {
            question: "채팅방 익명성 보장되나요?",
            answer:
                "채팅은 사용자 닉네임을 기반으로 익명성이 유지되며, 실명이나 개인정보는 노출되지 않습니다.",
        },
        {
            question: "채팅방에서 삭제한 메시지는 복구 가능한가요?",
            answer: "삭제한 메시지는 복구가 불가능하니 신중히 삭제해주세요.",
        },
        {
            question: "게시판 목록은 순서대로 보여지나요?",
            answer:
                "게시판은 최신순 또는 인기순 정렬이 적용되며, 설정에 따라 변경할 수 있습니다.",
        },
        {
            question: "삭제된 글/댓글 복구 가능한가요?",
            answer: "삭제된 글이나 댓글은 복구가 불가능합니다.",
        },
        {
            question: "개인정보 안전한가요?",
            answer:
                "모든 개인정보는 암호화되어 안전하게 관리되고 있으며, 외부에 노출되지 않습니다.",
        },
        {
            question: "인증이 갑자기 해제되었습니다!",
            answer:
                "네트워크 오류나 계정 상태 문제일 수 있습니다. 다시 로그인하거나 고객센터에 문의해주세요.",
        },
    ];
    const toggleExpand = (index) => {
        setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
    };

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
                    <Text style={styles.topFont}>자주묻는 질문</Text>
                </View>
                <View style={{ width: "15%" }}></View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {faqData.map((item, index) => (
                    <View key={index} style={styles.faqItem}>
                        <TouchableOpacity onPress={() => toggleExpand(index)}>
                            <Text style={styles.question}>Q. {item.question}</Text>
                        </TouchableOpacity>
                        {expandedIndex === index && (
                            <Text style={styles.answer}>A. {item.answer}</Text>
                        )}
                    </View>
                ))}
            </ScrollView>
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
    },
    topBtnContainer: {
        width: "15%",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: 10,
    },
    topTitleContainer: {
        width: "70%",
        justifyContent: "center",
        alignItems: "center",
    },
    topFont: {
        fontSize: 20,
        marginTop: 0,
        textAlign: "center",
        justifyContent: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        justifyContent: "space-between",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    scrollContent: {
        padding: 16,
    },
    faqItem: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        paddingBottom: 10,
    },
    question: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    answer: {
        marginTop: 8,
        fontSize: 15,
        color: "#555",
        lineHeight: 20,
    },
});