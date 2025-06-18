import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function SearchOutput({ route, navigation }) {
  const { keyword } = route.params;

  const items = [
    {
      id: 1,
      college: "서울대",
      title: "전공책 5개 팝니다~",
      price: "30,000원",
      likes: 30,
      views: 50,
    },
    {
      id: 2,
      college: "연세대",
      title: "경제학 전공 관련 요약",
      price: "무료",
      likes: 12,
      views: 18,
    },
    {
      id: 3,
      college: "고려대",
      title: "강의 자료 공유합니다",
      price: "10,000원",
      likes: 7,
      views: 22,
    },
  ];

  const filteredItems = items.filter(
    (item) => item.title.includes(keyword) || item.college.includes(keyword)
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listView}
      onPress={() => navigation.navigate("HomeDetailPage")}
    >
      <View>
        <Text style={styles.collegeFont}>{item.college}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.priceFont}>{item.price}</Text>
        <Text style={styles.metaInfo}>
          ♥ {item.likes} 👁 {item.views}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.topFont}>검색</Text>
        </View>
        <View style={{ width: "15%" }}></View>
      </View>

      <View style={styles.container}>
        <Text style={styles.keyword}>“{keyword}”에 대한 결과입니다.</Text>

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ fontSize: 16, color: "gray", marginTop: 10 }}>
              관련된 게시물이 없습니다.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 10 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  topBtnContainer: {
    width: "15%",
  },
  backButton: {
    padding: 5,
  },
  topTitleContainer: {
    width: "70%",
    alignItems: "center",
  },
  topFont: {
    fontSize: 18,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  keyword: {
    fontSize: 16,
    marginBottom: 10,
  },
  listView: {
    width: wp(92),
    backgroundColor: "#F9F9F9",
    alignSelf: "center",
    justifyContent: "center",
    padding: 15,
    marginTop: hp(1),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  collegeFont: {
    fontSize: wp(3.3),
    fontWeight: "bold",
    color: "gray",
  },
  title: {
    fontSize: wp(4),
    fontWeight: "600",
    marginTop: 5,
  },
  priceFont: {
    fontSize: wp(3.5),
    marginTop: 5,
    color: "#222",
  },
  metaInfo: {
    marginTop: 5,
    color: "gray",
    fontSize: wp(3),
  },
});
