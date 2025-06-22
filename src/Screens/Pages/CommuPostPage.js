import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    TextInput,
    Text,
    ScrollView,
    SafeAreaView,
    Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import IMAGES from '../../../assets';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function CommuPostPage({ navigation }) {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedPeople, setSelectedPeople] = useState("1");
    const [showPeoplePicker, setShowPeoplePicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isStartDate, setIsStartDate] = useState(true);
    const [photos, setPhotos] = useState([]);

    const MAX_PHOTOS = 8;

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || (isStartDate ? startDate : endDate);
        if (isStartDate) setStartDate(currentDate);
        else setEndDate(currentDate);
        setShowDatePicker(false);
    };

    const handleSelectPhoto = async () => {
        if (photos.length >= MAX_PHOTOS) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const selectedUri = result.assets[0].uri;
            setPhotos(prev => [...prev, { uri: selectedUri }].slice(0, MAX_PHOTOS));
        }
    };

    const handleTakePhoto = async () => {
        if (photos.length >= MAX_PHOTOS) return;

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const photoUri = result.assets[0].uri;
            setPhotos(prev => [...prev, { uri: photoUri }].slice(0, MAX_PHOTOS));
        }
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

                    {/* 사진 추가 버튼 */}
                    <View style={[styles.photoContainer, { marginBottom: hp(2) }]}>
                        <TouchableOpacity style={styles.photoEdit} onPress={handleTakePhoto}>
                            <FontAwesome name="camera" size={wp(5)} color="black" />
                            <Text style={styles.photoText}>카메라</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.photoEdit, { marginLeft: wp(3) }]} onPress={handleSelectPhoto}>
                            <FontAwesome name="image" size={wp(5)} color="black" />
                            <Text style={styles.photoText}>{photos.length}/{MAX_PHOTOS}</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.photoHint}>첫 번째 사진이 메인으로 설정됩니다.</Text>

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

                    {/* 모집 시작일 */}
                    <View style={styles.dateEdit}>
                        <TouchableOpacity onPress={() => { setIsStartDate(true); setShowDatePicker(true); }} style={styles.touchable}>
                            <Text style={styles.dateText}>
                                모집 시작일: {formatDate(startDate)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* 모집 종료일 */}
                    <View style={styles.dateEdit}>
                        <TouchableOpacity onPress={() => { setIsStartDate(false); setShowDatePicker(true); }} style={styles.touchable}>
                            <Text style={styles.dateText}>
                                모집 종료일: {formatDate(endDate)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* 날짜 선택 모달 */}
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

                    {/* 인원 선택 모달 */}
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
        height: hp('10%'),
        justifyContent: 'center',
    },
    middleView: {
        flex: 1,
        backgroundColor: 'white',
    },
    bottomView: {
        height: hp('8%'),
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
        marginTop: 4,
    },
    photoHint: {
        fontSize: wp(3),
        color: 'gray',
        marginLeft: wp(5),
        marginBottom: hp(2),
    },
    photoPreview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: hp(3),
        marginHorizontal: wp(5),
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
        width: wp('80%'),
        height: hp('5%'),
        backgroundColor: '#67574D',
        borderRadius: 15,
        marginBottom: hp('1%'),
    },
    postBtnText: {
        fontSize: wp(6),
        fontWeight: 'bold',
        color: 'white',
    },
});
