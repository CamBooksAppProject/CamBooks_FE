import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import IMAGES from "../../../assets";

const SettingModal = ({ isVisible, onClose, setNickname, setProfileImage }) => {
    const [nicknameModalVisible, setNicknameModalVisible] = useState(false); // 닉네임 설정 모달의 상태
    const [photoModalVisible, setPhotoModalVisible] = useState(false); // 닉네임 설정 모달의 상태
    const [newNickname, setNewNickname] = useState(""); // New nickname state

    // 닉네임 설정 모달 열기
    const openNicknameModal = () => {
        setNicknameModalVisible(true);
    };

    // 닉네임 설정 모달 닫기
    const closeNicknameModal = () => {
        setNicknameModalVisible(false);
    };

    const openPhotoModal = () => {
        setPhotoModalVisible(true);
    };


    const closePhotoModal = () => {
        setPhotoModalVisible(false);
    };

    // 확인 버튼 클릭 시 호출되는 함수
    const handleConfirmNickname = () => {
        setNickname(newNickname); // Update the nickname in MySetting
        closeNicknameModal(); // Close the nickname modal
    };

    const handleSelectPhoto = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.uri);  // 선택한 이미지로 프로필 업데이트
            closePhotoModal();  // 이미지 선택 후 모달 닫기
        }
    };

    // 프로필 사진 삭제
    const handleDeletePhoto = () => {
        setProfileImage(IMAGES.SWAPLOGOV2);  // 프로필 기본으로 변경하기
        closePhotoModal();
    };


    return (
        <>
            {/* 첫 번째 모달: 프로필 관리 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isVisible && !nicknameModalVisible} // 닉네임 설정 모달이 보이지 않을 때만 첫 번째 모달 표시
                onRequestClose={onClose}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>프로필 관리</Text>

                        <TouchableOpacity style={styles.modalMenu} onPress={openNicknameModal}>
                            <Text style={styles.menuFont}>닉네임 설정</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalMenu} onPress={openPhotoModal}>
                            <Text style={styles.menuFont}>프로필 사진 변경</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cBtn} onPress={onClose}>
                            <Text style={styles.cBtnText}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* 두 번째 모달: 닉네임 설정 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={nicknameModalVisible} // 닉네임 설정 모달의 상태에 따라 표시
                onRequestClose={closeNicknameModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>닉네임 설정</Text>

                        {/* 닉네임 입력 */}
                        <TextInput
                            style={styles.input}
                            placeholder="새 닉네임을 입력하세요"
                            value={newNickname} // Bind to newNickname state
                            onChangeText={setNewNickname} // Update newNickname state
                        />

                        <TouchableOpacity style={styles.cBtn} onPress={handleConfirmNickname}>
                            <Text style={styles.cBtnText}>확인</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* 세 번째 모달: 프로필 사진 설정 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={photoModalVisible} // 닉네임 설정 모달의 상태에 따라 표시
                onRequestClose={closePhotoModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>프로필 사진 변경</Text>


                        <TouchableOpacity style={styles.modalMenu} onPress={handleSelectPhoto}>
                            <Text style={styles.menuFont}>앨범에서 사진 선택</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalMenu} onPress={handleDeletePhoto}>
                            <Text style={styles.menuFont}>프로필 사진 삭제</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cBtn} onPress={closePhotoModal}>
                            <Text style={styles.cBtnText}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end", // 하단에 배치
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalView: {
        width: '100%',
        padding: 20,
        backgroundColor: "white",
        borderTopLeftRadius: 10, // 상단 모서리만 둥글게
        borderTopRightRadius: 10, // 상단 모서리만 둥글게
        alignItems: "stretch",
    },
    modalText: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 30,
        textAlign: "center",
    },
    modalMenu: {
        paddingHorizontal: 10,
        width: "100%",
        marginBottom: 20,
    },
    menuFont: {
        fontSize: 16,
        fontWeight: "400",
        textAlign: "left",
    },
    cBtn: {
        backgroundColor: "#67574D", // 버튼 배경색
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10,
    },
    cBtnText: {
        color: "white", // 버튼 텍스트 색상
        fontSize: 16,
        fontWeight: "bold",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
});

export default SettingModal;