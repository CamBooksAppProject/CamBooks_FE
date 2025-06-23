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

export default function HomeScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      if (!token) throw new Error("로그인이 필요합니다.");

      const response = await fetch("http://localhost:8080/cambooks/used-trade", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('items:', items);

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
          <View style={styles.iconRow}>
            <Image source={IMAGES.REDHEART} style={styles.iconImage} resizeMode="contain" />
            <Text style={styles.iconFont}>{item.postLikeCount}</Text>
            <Image source={IMAGES.EYE} style={styles.iconImage} resizeMode="contain" />
            <Text style={styles.iconFont}>{item.viewCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );



  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
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
  },
  title: {
    fontSize: wp(3.8),
    fontWeight: "600",
    maxWidth: wp(50),
  },
  priceFont: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: "#333",
    marginBottom: hp(0.3),
    marginLeft: hp(1.5),
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(0.5),
    marginLeft: hp(1.5),
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
});
