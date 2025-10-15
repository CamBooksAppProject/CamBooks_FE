import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import HomeScreenScrapPage from "../Pages/HomeScreenScrapPage";
import CommunityScrapPage from "../Pages/CommunityScrapPage";
import FreeBoardScrapPage from "../Pages/FreeBoardScrapPage";

const buttonData = ["중고거래", "커뮤니티", "자유게시판"];

const ScrapScreen = () => {
  const [selectedTab, setSelectedTab] = useState("중고거래");

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
      case "중고거래":
        return <HomeScreenScrapPage />;
      case "커뮤니티":
        return <CommunityScrapPage />;

      case "자유게시판":
        return <FreeBoardScrapPage />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={styles.fixedBar}>
        <View style={styles.horizontalBarContent}>
          {buttonData.map(renderButton)}
        </View>
      </View>

      <View style={{ flex: 1 }}>{renderContent()}</View>
    </SafeAreaView>
  );
};

export default ScrapScreen;

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
