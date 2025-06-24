import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import IMAGES from "../../../assets";
import api from "../../api/axiosInstance";

const SettingModal = ({
  isVisible,
  onClose,
  nickname,
  setNickname,
  setProfileImage,
}) => {
  const [nicknameModalVisible, setNicknameModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [newNickname, setNewNickname] = useState("");

  useEffect(() => {
    if (isVisible) {
      setNewNickname(nickname || "");
    }
  }, [isVisible, nickname]);

  const openNicknameModal = () => {
    setNicknameModalVisible(true);
    setNewNickname(nickname || "");
  };

  const closeNicknameModal = () => {
    setNicknameModalVisible(false);
  };

  const openPhotoModal = () => {
    setPhotoModalVisible(true);
  };

  const closePhotoModal = () => {
    setPhotoModalVisible(false);
  };

  const saveNicknameOnServer = async (nicknameToSave) => {
    console.log("saveNicknameOnServer called with:", nicknameToSave);

    if (!nicknameToSave || nicknameToSave.trim() === "") {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      let response;
      const encodedNickname = encodeURIComponent(nicknameToSave.trim());

      if (!nickname || nickname.trim() === "") {
        response = await api.post(
          `/member/nickname?nickname=${encodedNickname}`
        );
      } else {
        response = await api.put(
          `/member/nickname?nickname=${encodedNickname}`
        );
      }

      console.log("서버 응답:", response.data);
      setNickname(nicknameToSave.trim());
      alert("닉네임이 성공적으로 변경되었습니다.");
      closeNicknameModal();
      onClose();
    } catch (error) {
      console.error("닉네임 변경 실패:", error.response || error.message);
      alert("닉네임 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleConfirmNickname = () => {
    saveNicknameOnServer(newNickname);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {!nicknameModalVisible && !photoModalVisible && (
            <>
              <Text style={styles.modalTitle}>프로필 관리</Text>

              <TouchableOpacity
                onPress={openNicknameModal}
                style={styles.menuOption}
              >
                <Text style={styles.menuText}>닉네임 변경</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openPhotoModal}
                style={styles.menuOption}
              >
                <Text style={styles.menuText}>프로필 사진 변경</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
            </>
          )}

          {/* 닉네임 변경 모달 */}
          {nicknameModalVisible && (
            <View style={styles.nicknameModalContainer}>
              <Text style={styles.modalTitle}>닉네임 변경</Text>
              <TextInput
                style={styles.textInput}
                placeholder="닉네임을 입력하세요."
                value={newNickname}
                onChangeText={setNewNickname}
                maxLength={20}
                autoFocus={true}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={closeNicknameModal}
                >
                  <Text style={styles.buttonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleConfirmNickname}
                >
                  <Text style={styles.buttonText}>확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 사진 변경 모달 (기본 이미지로 바꾸기) */}
          {photoModalVisible && (
            <View style={styles.photoModalContainer}>
              <Text style={styles.modalTitle}>사진 변경</Text>

              <TouchableOpacity
                style={styles.menuOption}
                onPress={async () => {
                  // 카메라롤 권한 요청 후 사진 선택
                  const permissionResult =
                    await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (!permissionResult.granted) {
                    alert("사진 접근 권한이 필요합니다.");
                    return;
                  }
                  const pickerResult =
                    await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      aspect: [1, 1],
                      quality: 1,
                    });
                  if (!pickerResult.cancelled) {
                    // 여기서 서버 업로드 로직 추가 필요
                    setProfileImage({ uri: pickerResult.uri });
                    closePhotoModal();
                    onClose();
                  }
                }}
              >
                <Text style={styles.menuText}>사진 선택</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setProfileImage(IMAGES.LOGO);
                  closePhotoModal();
                  onClose();
                }}
              >
                <Text style={styles.menuText}>기본 이미지로 변경</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuOption, styles.cancelOption]}
                onPress={closePhotoModal}
              >
                <Text style={styles.menuText}>취소</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default SettingModal;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end", // 하단에 배치
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "white",
    borderTopLeftRadius: 10, // 상단 모서리만 둥글게
    borderTopRightRadius: 10, // 상단 모서리만 둥글게
    alignItems: "stretch",
  },
  menuOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  menuText: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "left",
  },
  cancelOption: {
    borderBottomWidth: 0,
  },
  nicknameModalContainer: {},
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  confirmButton: {
    backgroundColor: "#67574D",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  photoModalContainer: {},
});
