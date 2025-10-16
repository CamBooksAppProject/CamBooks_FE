import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import IMAGES from "../../../assets";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { BASE_URL } from '@env';

const statusDisplayMap = {
  'AVAILABLE': { text: '판매중', color: '#4A90E2' },
  'RESERVED': { text: '예약중', color: '#F4A261' },
  'COMPLETED': { text: '거래완료', color: '#B5534C' },
};

const universityList = [
  { id: 1, name: "서울대" },
  { id: 2, name: "강남대" },
  { id: 3, name: "고려대" },
  { id: 4, name: "연세대" },
  { id: 5, name: "성균관대" },
  { id: 6, name: "한국외국어대" },
  { id: 7, name: "한양대" },
  { id: 8, name: "중앙대" },
  { id: 9, name: "경희대" },
  { id: 10, name: "이화여자대" },
  { id: 11, name: "동국대" },
  { id: 12, name: "인천대" },
  { id: 13, name: "서울시립대" },
  { id: 14, name: "서강대" },
  { id: 15, name: "포항공과대" },
  { id: 16, name: "한국과학기술원" },
  { id: 17, name: "광주과학기술원" },
  { id: 18, name: "울산과학기술원" },
  { id: 19, name: "경북대" },
  { id: 20, name: "부산대" },
  { id: 21, name: "경상국립대" },
  { id: 22, name: "충북대" },
  { id: 23, name: "전북대" },
  { id: 24, name: "충남대" },
  { id: 25, name: "전남대" },
  { id: 26, name: "중앙대" },
  { id: 27, name: "국민대" },
  { id: 28, name: "명지대" },
  { id: 29, name: "서울과학기술대" },
  { id: 30, name: "세종대" },
  { id: 31, name: "한국기술교육대" },
  { id: 32, name: "한국예술종합" },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [viewType, setViewType] = useState("all");
  const [univName, setUnivName] = useState("");

  useFocusEffect(
    useCallback(() => {
      fetchData();
      loadUniversityName();
    }, [viewType])
  );

  const loadUniversityName = async () => {
    try {
      const storedId = await AsyncStorage.getItem("univId");
      if (storedId) {
        const found = universityList.find((u) => u.id === Number(storedId));
        if (found) setUnivName(found.name);
      }
    } catch (e) {
      console.log("univId 불러오기 실패:", e);
    }
  };

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const univId = await AsyncStorage.getItem('univId');

      if (!token) throw new Error("로그인이 필요합니다.");

      let url = `${BASE_URL}/cambooks/used-trade`;
      if (viewType === "university" && univId) {
        url += `?universityId=${univId}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setItems(Array.isArray(data) ? data : data.posts || []);
    } catch (error) {
      console.error("API 통신 오류:", error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listView}
      onPress={() => navigation.navigate("HomeDetailPage", { postId: item.id })}
    >
      <View style={{ flexDirection: "row" }}>
        <View style={styles.photo}>
          {item.thumbnailUrl ? (
            <Image
              source={{ uri: `${BASE_URL}${item.thumbnailUrl}` }}
              style={{ width: "100%", height: "100%", borderRadius: wp(1.5) }}
              resizeMode="cover"
            />
          ) : null}
        </View>
        <View style={styles.textWrapper}>
          <View style={styles.titleRow}>
            <Text style={styles.collegeFont}>{item.university}</Text>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {item.title}
            </Text>
          </View>
          <Text style={styles.priceFont}>
            {typeof item.price === "number"
              ? `${item.price.toLocaleString()}원`
              : item.price}
          </Text>


          <View style={styles.contentRow}>
            <View style={styles.iconRow}>
              <Image source={IMAGES.REDHEART} style={styles.iconImage} resizeMode="contain" />
              <Text style={styles.iconFont}>{item.postLikeCount}</Text>
              <View style={{ width: 8 }} />
              <Image source={IMAGES.EYE} style={styles.iconImage} resizeMode="contain" />
              <Text style={styles.iconFont}>{item.viewCount}</Text>
            </View>

            <Text style={[
              styles.statusBadge, { backgroundColor: statusDisplayMap[item.status].color }
            ]}>
              {statusDisplayMap[item.status].text}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={{ padding: 5, marginHorizontal: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => setViewType("all")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.viewText, viewType === "all" && styles.activeView]}>
              모두 보기
            </Text>
          </TouchableOpacity>

          <Text style={{ color: "black", marginHorizontal: 5 }}>|</Text>

          <TouchableOpacity
            onPress={() => setViewType("university")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.viewText, viewType === "university" && styles.activeView]}>
              {univName}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>데이터 없음</Text>
        }
      />
      <TouchableOpacity
        style={styles.additBtn}
        onPress={() => navigation.navigate("HomePostPage")}
      >
        <Image
          source={IMAGES.PLUS}
          style={styles.plusIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  viewText: {
    color: "black",
    fontSize: wp(3.8),
    fontWeight: "500",
  },

  activeView: {
    fontWeight: "700",
  },

  listView: {
    width: wp(92),
    height: hp(11),
    backgroundColor: "white",
    alignSelf: "center",
    justifyContent: "center",
    marginTop: hp(1),
    borderBottomWidth: 0.5,
    borderBottomColor: "#CDCDCD",
  },
  photo: {
    width: wp(18),
    height: wp(18),
    marginLeft: wp(2.5),
    borderColor: "#E9E9E9",
    borderWidth: 1,
    borderRadius: wp(1.5),
    backgroundColor: "gray",
    overflow: "hidden",
  },
  textWrapper: {
    flex: 1,
    marginLeft: wp(3),
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.3),
  },
  collegeFont: {
    fontSize: wp(3),
    fontWeight: "bold",
    color: "gray",
    marginRight: wp(1.5),
    marginLeft: hp(1.5),
  },
  title: {
    fontSize: wp(3.8),
    fontWeight: "600",
    maxWidth: wp(50),
    marginLeft: hp(1),
  },
  priceFont: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: "#333",
    marginBottom: hp(0.3),
    marginLeft: hp(1.5),
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginTop: hp(0.5),
    marginLeft: hp(1.5),
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconFont: {
    fontSize: wp(2.8),
    fontWeight: "bold",
    color: "gray",
    marginLeft: wp(1.5),
    marginRight: wp(1.5),
  },
  iconImage: {
    height: wp(4),
    width: wp(4),
  },
  statusBadge: {
    fontSize: wp(3.5),
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: 5,
    overflow: 'hidden',
  },
  additBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: wp(14),
    height: wp(14),
    backgroundColor: "#59B283",
    borderRadius: wp(14) / 2,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    position: "absolute",
    bottom: hp(4),
    right: wp(6),
  },
  plusIcon: {
    height: wp(6),
    width: wp(6),
  },
  emptyText: {
    alignSelf: 'center',
    marginTop: hp(5),
    fontSize: wp(4),
    color: '#999',
  },
});
