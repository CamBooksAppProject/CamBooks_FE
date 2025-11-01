import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { MaterialIcons, Ionicons } from "@expo/vector-icons";

import IMAGES from "../../assets";

import HomeScreen from "../Screens/Pages/HomeScreen";
import ChatScreen from "../Screens/Pages/ChatScreen";
import ScrapScreen from "../Screens/Pages/ScrapScreen";
import CommunityScreen from "../Screens/Pages/CommunityScreen";
import ProfileScreen from "../Screens/Pages/ProfileScreen";
import api, { chatApi } from "../api/axiosInstance";

const BottomTab = createBottomTabNavigator();

const Header = ({ name, navigation }) => (
  <SafeAreaView style={{ backgroundColor: "white" }} edges={['top']}>
    < View style={styles.header} >
      {name === "중고거래" ? (
        <View style={styles.topContainer}>
          <Text style={styles.topFont}>중고거래</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={styles.setButton}
              onPress={() => navigation.navigate("SearchingPage")}
            >
              <Ionicons name="search" size={26} color="#67574D" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.setButton, { marginLeft: 15 }]}
              onPress={() => navigation.navigate("NotificationPage")}
            >
              <Ionicons name="notifications" size={26} color="#67574D" />
            </TouchableOpacity>
          </View>
        </View>
      ) : name === "커뮤니티" ? (
        <View style={styles.topContainer}>
          <Text style={styles.topFont}>커뮤니티</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={styles.setButton}
              onPress={() => navigation.navigate("SearchingPage")}
            >
              <Ionicons name="search" size={26} color="#67574D" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.setButton, { marginLeft: 15 }]}
              onPress={() => navigation.navigate("NotificationPage")}
            >
              <Ionicons name="notifications" size={26} color="#67574D" />
            </TouchableOpacity>
          </View>
        </View>
      ) : name === "채팅" ? (
        <View style={styles.topContainer}>
          <Text style={styles.topFont}>채팅</Text>
          <TouchableOpacity
            style={[styles.setButton, { marginLeft: 15 }]}
            onPress={() => navigation.navigate("NotificationPage")}
          >
            <Ionicons name="notifications" size={26} color="#67574D" />
          </TouchableOpacity>
        </View>
      ) : name === "스크랩" ? (
        <View style={styles.topContainer}>
          <Text style={styles.topFont}>스크랩</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={styles.setButton}
              onPress={() => navigation.navigate("SearchingPage")}
            >
              <Ionicons name="search" size={26} color="#67574D" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.setButton, { marginLeft: 15 }]}
              onPress={() => navigation.navigate("NotificationPage")}
            >
              <Ionicons name="notifications" size={26} color="#67574D" />
            </TouchableOpacity>
          </View>
        </View>
      ) : name === "마이페이지" ? (
        <View style={styles.topContainer}>
          <Text style={styles.topFont}>마이페이지</Text>
          <TouchableOpacity
            style={styles.setButton}
            onPress={() => navigation.navigate("SettingPage")}
          >
            <MaterialIcons name="settings" size={26} color="#67574D" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.topContainer}>
          <Text style={styles.topFont}>채팅</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={styles.setButton}
              onPress={() => navigation.navigate("SearchingPage")}
            >
              <Ionicons name="search" size={26} color="#67574D" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.setButton, { marginLeft: 15 }]}
              onPress={() => navigation.navigate("NotificationPage")}
            >
              <Ionicons name="notifications" size={26} color="#67574D" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View >
  </SafeAreaView >
);

const BottomTabIcon = (name, focused, badgeCount = 0) => {
  const icons = {
    중고거래: IMAGES.HOME,
    커뮤니티: IMAGES.COMMUNITY,
    채팅: IMAGES.CHAT,
    스크랩: IMAGES.SCRAP,
    마이페이지: IMAGES.PROFILE,
  };

  return (
    <View style={styles.bottomTabIconContainer}>
      <Image
        source={icons[name]}
        resizeMode="contain"
        style={[
          styles.bottomTabIcon,
          { tintColor: focused ? "#474747" : "#D1D1D1" },
        ]}
      />
      {badgeCount > 0 && name === "채팅" && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
      <Text
        style={[
          styles.bottomTabFont,
          { color: focused ? "#474747" : "#D1D1D1" },
        ]}
      >
        {name}
      </Text>
    </View>
  );
};

const TotalTab = (name, component, key, headerShown = true, badgeCount = 0) => (
  <BottomTab.Screen
    name={key}
    component={component}
    options={({ navigation }) => ({
      header: headerShown
        ? () => <Header name={name} navigation={navigation} />
        : undefined,
      tabBarIcon: ({ focused }) => BottomTabIcon(name, focused, badgeCount),
    })}
  />
);

export default function RouteScreen({ navigation }) {
  const [chatBadge, setChatBadge] = useState(0);

  const refreshChatBadge = async () => {
    try {
      const rooms = await chatApi.getMyChatRooms();
      if (Array.isArray(rooms)) {
        const unread = rooms.reduce((acc, r) => acc + (r.unReadCount || r.unReadCnt || 0), 0);
        setChatBadge(unread);
      } else {
        setChatBadge(0);
      }
    } catch (e) {
      console.warn("채팅 배지 갱신 실패:", e);
      setChatBadge(0);
    }
  };

  useEffect(() => {
    // initial fetch
    refreshChatBadge();
    // refresh when this screen (RouteScreen) regains focus
    const unsub = navigation.addListener("focus", () => {
      refreshChatBadge();
    });
    return unsub;
  }, [navigation]);

  return (
    <BottomTab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: styles.bottomTabStyle,
      }}
    >
      {TotalTab("중고거래", HomeScreen, "HomeScreen")}
      {TotalTab("커뮤니티", CommunityScreen, "CommunityScreen")}
      {TotalTab("채팅", ChatScreen, "ChatScreen", true, chatBadge)}
      {TotalTab("스크랩", ScrapScreen, "ScrapScreen")}
      {TotalTab("마이페이지", ProfileScreen, "ProfileScreen")}
    </BottomTab.Navigator>
  );
}
const styles = StyleSheet.create({
  header: {
    backgroundColor: "white",
    height: hp(5),
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
  },
  topContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  topFont: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  setButton: {
    padding: 5,
  },
  logo: {
    width: wp(20),
    height: hp(6),
  },
  search: {
    width: wp(6),
    height: wp(6),
    tintColor: "#474747",
    marginRight: wp(3),
  },
  notificationIcon: {
    width: wp(6.5),
    height: wp(6.5),
  },
  setting: {
    width: wp(6.5),
    height: wp(6.5),
  },
  bottomTabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    top: hp(1),
  },
  bottomTabIcon: {
    width: wp(8),
    height: wp(8),
  },
  bottomTabFont: {
    fontSize: wp(3.2),
  },
  bottomTabStyle: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    paddingHorizontal: wp(2.5),
    height: hp(10),
  },
  badgeContainer: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#FF3B30',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
