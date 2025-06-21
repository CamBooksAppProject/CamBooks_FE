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

export default function HomeScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState([
    {
      id: 1,
      college: "서울대",
      title: "전공책 5개 팝니다~",
      price: "30,000원",
      likes: 30,
      views: 50,
    },
  ]);

  useEffect(() => {
    // fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("https://your.api.endpoint.com/posts");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("API 통신 오류:", error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listView}
      onPress={() => navigation.navigate("HomeDetailPage")}
    >
      <View style={{ flexDirection: "row" }}>
        <View style={styles.photo} />
        <View style={{ flexDirection: "column" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.collegeFont}>{item.college}</Text>
            <Text style={styles.title}>{item.title}</Text>
          </View>
          <Text style={styles.priceFont}>{item.price}</Text>
          <View style={styles.iconRow}>
            <Image
              source={IMAGES.REDHEART}
              style={styles.iconImage}
              resizeMode="contain"
            />
            <Text style={styles.iconFont}>{item.likes}</Text>
            <Image
              source={IMAGES.EYE}
              style={styles.iconImage}
              resizeMode="contain"
            />
            <Text style={styles.iconFont}>{item.views}</Text>
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
    backgroundColor: "orange",
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
  collegeFont: {
    fontSize: wp(3),
    fontWeight: "bold",
    color: "gray",
    marginLeft: wp(3),
  },
  title: {
    fontSize: wp(3.5),
    fontWeight: "bold",
    marginLeft: wp(2),
  },
  priceFont: {
    fontSize: wp(3.3),
    marginLeft: wp(3),
    marginTop: hp(0.5),
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: wp(3),
    marginTop: hp(0.8),
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
});
