import { StyleSheet, View, TouchableOpacity, Image, TextInput, Text, ScrollView, SafeAreaView, Modal, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import IMAGES from '../../../assets';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function CommuPostPage({ navigation }) {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedPeople, setSelectedPeople] = useState("1");
    const [showPeoplePicker, setShowPeoplePicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isStartDate, setIsStartDate] = useState(true);
    const [photos, setPhotos] = useState([]);
    const [items, setItems] = useState([]);

    useEffect(() => {
        // fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('https://your.api.endpoint.com/posts');
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error('API 통신 오류:', error);
        }
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || (isStartDate ? startDate : endDate);
        if (isStartDate) {
            setStartDate(currentDate);
        } else {
            setEndDate(currentDate);
        }
        setShowDatePicker(false);
    };

    const handleCameraPress = () => {
        Alert.alert(
            "사진 선택",
            "사진을 선택할 방법을 선택하세요",
            [
                {
                    text: "카메라",
                    onPress: () => launchCamera({
                        mediaType: 'photo',
                        maxWidth: 300,
                        maxHeight: 300,
                        quality: 1,
                    }, (response) => {
                        if (response.didCancel) {
                            console.log('User cancelled image picker');
                        } else if (response.error) {
                            console.log('ImagePicker Error: ', response.error);
                        } else {
                            const source = { uri: response.assets[0].uri };
                            setPhotos([...photos, source]);
                        }
                    }),
                },
                {
                    text: "갤러리",
                    onPress: () => launchImageLibrary({
                        mediaType: 'photo',
                        maxWidth: 300,
                        maxHeight: 300,
                        quality: 1,
                    }, (response) => {
                        if (response.didCancel) {
                            console.log('User cancelled image picker');
                        } else if (response.error) {
                            console.log('ImagePicker Error: ', response.error);
                        } else {
                            const source = { uri: response.assets[0].uri };
                            setPhotos([...photos, source]);
                        }
                    }),
                },
                {
                    text: "취소",
                    style: "cancel",
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView />
            <View style={styles.topView}>
                <TouchableOpacity onPress={() => navigation.navigate("RouteScreen")} style={{ marginLeft: wp(4) }}>
                    <Image
                        source={IMAGES.BACK}
                        resizeMode="contain"
                        tintColor="#474747"
                        style={{ width: wp(6), height: wp(6) }}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.middleView}>
                <ScrollView>
                    {/* 이미지 선택 기능 */}
                    <View style={styles.photoContainer}>
                        <View style={styles.photoEdit}>
                            <TouchableOpacity onPress={handleCameraPress}>
                                <FontAwesome name="camera" size={wp(5)} color="black" />
                                <Text style={styles.photoText}>0/8</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.photoHint}>첫 번째 사진이 메인으로 설정됩니다.</Text>
                    </View>

                    {/* 선택된 사진 미리보기 */}
                    <View style={styles.photoPreview}>
                        {photos.map((photo, index) => (
                            <Image
                                key={index}
                                source={photo}
                                style={styles.photoImage}
                            />
                        ))}
                    </View>

                    {/* 제목 입력 */}
                    <View style={styles.titleEdit}>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="제목을 입력하세요."
                        />
                    </View>

                    {/* 내용 입력 */}
                    <View style={styles.contentsEdit}>
                        <TextInput
                            style={styles.contentsInput}
                            placeholder="내용을 입력하세요. (500자)"
                            maxLength={500}
                            multiline={true}
                        />
                    </View>

                    {/* 모집 기간 설정 (시작일, 종료일) */}
                    <View style={styles.dateEdit}>
                        <TouchableOpacity onPress={() => { setIsStartDate(true); setShowDatePicker(true); }} style={styles.touchable}>
                            <Text style={styles.dateText}>
                                모집 시작일: {formatDate(startDate)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dateEdit}>
                        <TouchableOpacity onPress={() => { setIsStartDate(false); setShowDatePicker(true); }} style={styles.touchable}>
                            <Text style={styles.dateText}>
                                모집 종료일: {formatDate(endDate)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Modal visible={showDatePicker} transparent={true} animationType="slide">
                        <View style={styles.modalContainer}>
                            <View style={styles.pickerContainer}>
                                <DateTimePicker
                                    value={isStartDate ? startDate : endDate}
                                    mode="date"
                                    display="calendar"
                                    onChange={onDateChange}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowDatePicker(false)}
                                    style={styles.closePickerBtn}
                                >
                                    <Text style={styles.confirmText}>확인</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    {/* 모집 인원 선택 */}
                    <View style={styles.numberEdit}>
                        <TouchableOpacity onPress={() => setShowPeoplePicker(true)} style={styles.touchable}>
                            <Text style={styles.dateText}>
                                모집 인원: {selectedPeople}명
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Modal visible={showPeoplePicker} transparent={true} animationType="slide">
                        <View style={styles.modalContainer}>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedPeople}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => setSelectedPeople(itemValue)}
                                >
                                    {Array.from({ length: 100 }, (_, i) => (
                                        <Picker.Item key={i} label={`${i + 1}명`} value={`${i + 1}`} />
                                    ))}
                                </Picker>
                                <TouchableOpacity
                                    onPress={() => setShowPeoplePicker(false)}
                                    style={styles.closePickerBtn}
                                >
                                    <Text style={styles.confirmText}>확인</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </ScrollView>
            </View>

            <View style={styles.bottomView}>
                <TouchableOpacity style={styles.postBtn}>
                    <Text style={styles.postBtnText}>작성 완료</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    topView: {
        backgroundColor: 'white',
        width: '100%',
        height: hp(10),
        justifyContent: 'center',
    },
    middleView: {
        backgroundColor: 'white',
        width: '100%',
        height: hp(73),
    },
    bottomView: {
        flexDirection: 'row',
        backgroundColor: 'white',
        width: '100%',
        height: hp(9),
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 0.5,
        borderTopColor: 'gray',
    },
    photoContainer: {
        flexDirection: 'row',
        width: wp(90),
        alignSelf: 'center',
        alignItems: 'center',
        marginBottom: hp(3),
    },
    photoEdit: {
        justifyContent: 'center',
        alignItems: 'center',
        width: wp(12),
        height: wp(12),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: wp(3),
    },
    photoText: {
        fontSize: wp(3),
    },
    photoHint: {
        fontSize: wp(3),
        color: 'gray',
        marginLeft: wp(2),
    },
    photoPreview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: hp(3),
    },
    photoImage: {
        width: wp(20),
        height: wp(20),
        margin: wp(1),
        borderRadius: wp(2),
    },
    titleEdit: {
        justifyContent: 'center',
        alignSelf: 'center',
        width: wp(90),
        height: hp(6),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: wp(3),
        marginBottom: hp(3),
    },
    titleInput: {
        marginLeft: wp(5),
    },
    contentsEdit: {
        alignSelf: 'center',
        width: wp(90),
        height: hp(40),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: wp(3),
        marginBottom: hp(3),
    },
    contentsInput: {
        padding: wp(5),
    },
    dateEdit: {
        justifyContent: 'center',
        alignSelf: 'center',
        width: wp(90),
        height: hp(6),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: wp(3),
        marginBottom: hp(3),
    },
    touchable: {
        justifyContent: 'center',
    },
    dateText: {
        marginLeft: wp(5),
        fontSize: wp(4),
    },
    numberEdit: {
        justifyContent: 'center',
        alignSelf: 'center',
        width: wp(90),
        height: hp(6),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: wp(3),
        marginBottom: hp(3),
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    pickerContainer: {
        width: wp(60),
        backgroundColor: 'white',
        borderRadius: wp(3),
        padding: wp(3),
        justifyContent: 'center',
        alignItems: 'center',
    },
    picker: {
        height: hp(20),
        width: '100%',
    },
    closePickerBtn: {
        marginTop: hp(3),
        padding: wp(3),
        backgroundColor: '#67574D',
        borderRadius: wp(3),
    },
    confirmText: {
        fontSize: wp(4),
        fontWeight: 'bold',
        color: 'white',
    },
    postBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        width: wp(90),
        height: hp(6),
        backgroundColor: '#67574D',
        borderRadius: wp(3),
    },
    postBtnText: {
        fontSize: wp(6),
        fontWeight: 'bold',
        color: 'white',
    },
});
