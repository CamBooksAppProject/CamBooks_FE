import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function SearchingPage({ navigation }) {
  const [recentSearches, setRecentSearches] = useState([
    "파이썬",
    "심리",
    "토익",
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  const removeSearch = (term) => {
    setRecentSearches(recentSearches.filter((item) => item !== term));
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    Keyboard.dismiss();

    if (!recentSearches.includes(searchTerm)) {
      setRecentSearches([searchTerm, ...recentSearches]);
    }

    navigation.navigate("SearchOutput", { keyword: searchTerm });
    setSearchTerm("");
  };

  const handleTagPress = (term) => {
    Keyboard.dismiss();

    if (!recentSearches.includes(term)) {
      setRecentSearches([term, ...recentSearches]);
    }

    navigation.navigate("SearchOutput", { keyword: term });
    setSearchTerm("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="검색어를 입력하세요."
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.confirmButton} onPress={handleSearch}>
          <Text style={styles.confirmButtonText}>검색</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.viewContainer}>
        <Text style={styles.searchTitle}>최근 검색</Text>
        <View style={styles.tagContainer}>
          {recentSearches.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleTagPress(item)}
              style={styles.recentTag}
              activeOpacity={0.8}
            >
              <Text style={styles.recentSearch}>{item}</Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation(); // 검색 막고 삭제만 수행
                  removeSearch(item);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  input: {
    backgroundColor: "#F7F7F7",
    width: "65%",
    height: 45,
    marginVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  confirmButton: {
    backgroundColor: "#000",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  viewContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  popularTag: {
    backgroundColor: "#d3d3d3",
    borderRadius: 100,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  popularSearch: {
    fontSize: 14,
    textAlign: "center",
  },
  recentTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#d3d3d3",
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  recentSearch: {
    fontSize: 14,
    marginRight: 8,
  },
  closeBtn: {
    fontSize: 14,
    color: "#999",
  },
});
