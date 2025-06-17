import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function PurchaseHistory() {
  const navigation = useNavigation();

  const purchasedItems = [
    {
      id: 1,
      college: "OO대학교",
      title: "자료구조 책",
      price: "10,000원",
      likes: 23,
      views: 104,
    },
    {
      id: 2,
      college: "XX대학교",
      title: "운영체제 정리노트",
      price: "5,000원",
      likes: 12,
      views: 89,
    },
  ];

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
          <Text style={styles.topFont}>구매 내역</Text>
        </View>
        <View style={{ width: "15%" }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {purchasedItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemContainer}
            onPress={() => navigation.navigate("HomeDetailPage", { item })}
          >
            <View style={styles.photo} />
            <View style={{ flexDirection: "column", marginLeft: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.collegeFont}>{item.college} </Text>
                <Text style={styles.title}>{item.title}</Text>
              </View>
              <Text style={styles.priceFont}>{item.price}</Text>
              <View style={styles.iconRow}>
                <MaterialIcons name="favorite" size={16} color="#E57373" />
                <Text style={styles.iconFont}>{item.likes}</Text>
                <MaterialIcons name="remove-red-eye" size={16} color="#555" />
                <Text style={styles.iconFont}>{item.views}</Text>
              </View>
            </View>
          </TouchableOpacity>
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
  backButton: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  topTitleContainer: {
    width: "70%",
    justifyContent: "center",
    alignItems: "center",
  },
  topFont: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  photo: {
    width: 80,
    height: 80,
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
  collegeFont: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 5,
  },
  title: {
    fontSize: 14,
    color: "#333",
  },
  priceFont: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 5,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  iconFont: {
    fontSize: 12,
    color: "#666",
    marginRight: 10,
    marginLeft: 4,
  },
});
