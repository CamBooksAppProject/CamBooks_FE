import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import IMAGES from '../../../assets';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import { MaterialIcons } from "@expo/vector-icons";

export default function FreeBoardPage() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchScrappedPosts();
    }, [])
  );

  const fetchCommentCount = async (postId) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${BASE_URL}/cambooks/general-forum/comment/count?postId=${postId}`, {
        headers: {
          'Accept': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error('댓글 수 조회 실패');
      const count = await res.json();
      return count;
    } catch (err) {
      console.error(`댓글 수 조회 실패 postId:${postId}`, err);
      return 0;
    }
  };

  const fetchScrappedPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const likedRes = await fetch(`${BASE_URL}/cambooks/post-likes/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const likedData = await likedRes.json();
      const likedPosts = likedData["GENERAL_FORUM"] || [];

      const postsWithComments = await Promise.all(
        likedPosts.map(async (post) => {
          const commentCount = await fetchCommentCount(post.id);
          return { ...post, commentCount };
        })
      );

      setItems(postsWithComments);
    } catch (error) {
      console.error("스크랩 게시글 불러오기 실패:", error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listView}
      onPress={() => navigation.navigate('FreeBoardDetailPage', { postId: item.id })}
    >
      <View style={{ flexDirection: 'column' }}>
        <Text style={styles.title}>{item.title ?? ''}</Text>
        <Text style={styles.contentsFont} numberOfLines={2}>{item.content ?? ''}</Text>

        <View style={styles.infoRow}>
          <View style={styles.userInfo}>
            <MaterialIcons
              name="account-circle"
              size={16}
              color="#ccc"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.nameFont}>{item.writerName ?? ''}</Text>
            <Text style={styles.timeFont}>{item.createdAt ? item.createdAt.split('T')[0] : ''}</Text>
          </View>

          <View style={styles.statsRow}>
            <Image
              source={IMAGES.REDHEART}
              resizeMode="contain"
              style={styles.icon}
            />
            <Text style={styles.iconFont}>{String(item.postLikeCount ?? 0)}</Text>

            <Image
              source={IMAGES.COMMENT}
              resizeMode="contain"
              style={styles.icon}
            />
            <Text style={styles.iconFont}>{String(item.commentCount ?? 0)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: hp(14) }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>데이터 없음</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listView: {
    width: wp(90),
    paddingVertical: hp(1.5),
    alignSelf: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#CDCDCD',
  },
  title: {
    fontSize: wp(3.5),
    fontWeight: 'bold',
    marginLeft: wp(4),
  },
  contentsFont: {
    fontSize: wp(3),
    color: '#515a5a',
    marginLeft: wp(4),
    marginTop: hp(0.5),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1),
    marginHorizontal: wp(4),
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameFont: {
    fontSize: wp(3),
    marginLeft: wp(1.5),
  },
  timeFont: {
    fontSize: wp(2.5),
    color: 'gray',
    marginLeft: wp(1.5),
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: wp(3),
    height: wp(3),
  },
  iconFont: {
    fontSize: wp(2.5),
    fontWeight: 'bold',
    color: 'gray',
    marginHorizontal: wp(1.5),
  },
  emptyText: {
    alignSelf: 'center',
    marginTop: hp(5),
    fontSize: wp(4),
    color: '#999',
  },
});
