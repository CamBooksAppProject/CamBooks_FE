import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { useEffect } from "react";
import { useRoute } from "@react-navigation/native";

import CommunityPage from "./CommunityPage";
import FreeBoardPage from "./FreeBoardPage";

const buttonData = ["커뮤니티", "자유게시판"];

const CommunityScreen = () => {
  const route = useRoute();
  const [selectedTab, setSelectedTab] = useState("커뮤니티");

  useEffect(() => {
    if (route.params?.selectedTab) {
      setSelectedTab(route.params.selectedTab);
    }
  }, [route.params?.selectedTab]);

  const renderButton = (label) => {
    const isSelected = selectedTab === label;

    return (
      <TouchableOpacity
        key={label}
        style={[
          styles.scrollButton,
          isSelected && { backgroundColor: "#67574D", borderColor: "#67574D" },
        ]}
        onPress={() => setSelectedTab(label)}
      >
        <Text
          style={[
            styles.scrollButtonText,
            isSelected && { color: "#fff", fontWeight: "bold" },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "커뮤니티":
        return <CommunityPage />;
      case "자유게시판":
        return <FreeBoardPage />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.fixedBar}>
        <View style={styles.horizontalBarContent}>
          {buttonData.map(renderButton)}
        </View>
      </View>

      <View style={{ flex: 1 }}>{renderContent()}</View>
    </SafeAreaView>
  );
};

export default CommunityScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fixedBar: {
    backgroundColor: "#fff",
    paddingVertical: hp("1%"),
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    zIndex: 10,
  },
  horizontalBarContent: {
    paddingHorizontal: wp("5%"),
    flexDirection: "row",
  },
  scrollButton: {
    marginRight: wp("3%"),
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.8%"),
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  scrollButtonText: {
    fontSize: wp("3.5%"),
    color: "black",
  },
});
