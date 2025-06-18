import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import SplashScreen from "./src/Screens/SplashScreen";
import RouteScreen from "./src/Navigation/RouteScreen";
import LoginScreen from "./src/Screens/LoginScreen";
import SignUpScreen from "./src/Screens/SignUpScreen";
import AuthenticationScreen from "./src/Screens/AuthenticationScreen";
import GuestScreen from "./src/Screens/GuestScreen";

import HomeScreen from "./src/Screens/HomeScreen";
import CommunityScreen from "./src/Screens/CommunityScreen";
import ChatScreen from "./src/Screens/ChatScreen";
import ScrapScreen from "./src/Screens/ScrapScreen";
import ProfileScreen from "./src/Screens/ProfileScreen";

import CommnuityPage from "./src/Screens/Pages/CommunityPage";
import FreeBoardPage from "./src/Screens/Pages/FreeBoardPage";

import CommunityScrapPage from "./src/Screens/Pages/CommunityScrapPage";
import HomeScreenScrapPage from "./src/Screens/Pages/HomeScreenScrapPage";
import FreeBoardScrapPage from "./src/Screens/Pages/FreeBoardScrapPage";

import HomePostPage from "./src/Screens/Pages/HomePostPage";
import CommuPostPage from "./src/Screens/Pages/CommuPostPage";
import FreeBoardPostPage from "./src/Screens/Pages/FreeBoardPostPage";

import HomeDetailPage from "./src/Screens/Pages/HomeDetailPage";
import CommuDetailPage from "./src/Screens/Pages/CommuDetailPage";
import FreeBoardDetailPage from "./src/Screens/Pages/FreeBoardDetailPage";
import ChatDetailPage from "./src/Screens/Pages/ChatDetailPage";

import SearchingPage from "./src/Screens/Pages/SearchingPage";
import SearchOutput from "./src/Screens/Pages/SearchOutput";
import NotificationPage from "./src/Screens/Pages/NotificationPage";
import SettingPage from "./src/Screens/Pages/SettingPage";
import SettingModal from "./src/Screens/Pages/SettingModal";

import FindId from "./src/Screens/Pages/FindId";
import FindPw from "./src/Screens/Pages/FindPw";
import NoticePage from "./src/Screens/Pages/NoticePage";
import ChangePw from "./src/Screens/Pages/ChangePw";
import ChangeAddr from "./src/Screens/Pages/ChangeAddr";

import MyInfo from "./src/Screens/Pages/MyInfo";
import MyPost from "./src/Screens/Pages/MyPost";

import SalesHistory from "./src/Screens/Pages/SalesHistory";
import PurchaseHistory from "./src/Screens/Pages/PurchaseHistory";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsShowSplash(false);
    }, 1000);
  });

  return (
    <>
      {isShowSplash ? (
        <SplashScreen />
      ) : (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="LoginScreen">
              <Stack.Screen
                name="RouteScreen"
                component={RouteScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="LoginScreen"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SignUpScreen"
                component={SignUpScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AuthenticationScreen"
                component={AuthenticationScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="FindId"
                component={FindId}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="FindPw"
                component={FindPw}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ChangePw"
                component={ChangePw}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ChangeAddr"
                component={ChangeAddr}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MyInfo"
                component={MyInfo}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MyPost"
                component={MyPost}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SalesHistory"
                component={SalesHistory}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PurchaseHistory"
                component={PurchaseHistory}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="GuestScreen"
                component={GuestScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CommunityScreen"
                component={CommunityScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ChatScreen"
                component={ChatScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ScrapScreen"
                component={ScrapScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ProfileScreen"
                component={ProfileScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CommnuityPage"
                component={CommnuityPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="FreeBoardPage"
                component={FreeBoardPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CommunityScrapPage"
                component={CommunityScrapPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="HomeScreenScrapPage"
                component={HomeScreenScrapPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="FreeBoardScrapPage"
                component={FreeBoardScrapPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="HomePostPage"
                component={HomePostPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CommuPostPage"
                component={CommuPostPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="FreeBoardPostPage"
                component={FreeBoardPostPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="HomeDetailPage"
                component={HomeDetailPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CommuDetailPage"
                component={CommuDetailPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="FreeBoardDetailPage"
                component={FreeBoardDetailPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ChatDetailPage"
                component={ChatDetailPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SearchingPage"
                component={SearchingPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SearchOutput"
                component={SearchOutput}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="NotificationPage"
                component={NotificationPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="NoticePage"
                component={NoticePage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SettingPage"
                component={SettingPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SettingModal"
                component={SettingModal}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      )}
    </>
  );
}
