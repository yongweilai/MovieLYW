import React, { useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookmarkStackParamList, MovieItem } from '../navigator/types';
import { watchlistStorage, WatchlistItem } from '../storage/watchlistStorage';
import { movieApi } from '../api/movieApi';
import { API_CONFIG } from '../api/config';
import AppFlashList from '../components/AppFlashList';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { bookmarkActions } from '../store';
import AppLogoTheMovieDb from '../assets/app_logo_the_movie_db.svg';

type BookmarkMovie = MovieItem & {
  rating: number;
  addedAt: string;
};
type Props = NativeStackScreenProps<BookmarkStackParamList, 'BookmarkMain'>;

const gravatarBaseUrl = 'https://www.gravatar.com/avatar';

const Logo = () => {
  return (
    <View style={styles.logoContainer}>
      <AppLogoTheMovieDb width={100} height={100} />
    </View>
  );
};

const BookmarkCard = ({
    item,
    onRemove,
    onPress,
  }: {
    item: BookmarkMovie;
    onRemove: (id: string) => void;
    onPress: () => void;
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.movieCard}
        onPress={onPress}
      >
        <Image source={{ uri: item.poster }} style={styles.poster} resizeMode="cover" />
  
        <View style={styles.movieContent}>
          <View style={styles.movieHeaderRow}>
            <Text style={styles.movieTitle} numberOfLines={1}>
              {item.title}
            </Text>
  
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onRemove(item.id)}
              style={styles.removeButton}
            >
              <Text style={styles.removeIcon}>×</Text>
            </TouchableOpacity>
          </View>
  
          <Text style={styles.movieDate}>{item.releaseDate}</Text>
  
          <Text style={styles.movieOverview} numberOfLines={3}>
            {item.overview}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

const BookmarkScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const bookmark = useAppSelector(state => state.bookmark);
  const { items: movies, account, filter } = bookmark;
  const { filterBy, orderBy } = filter;

  useEffect(() => {
    if (!API_CONFIG.ACCOUNT_ID) return;
    let isMounted = true;
    movieApi.getAccountDetails(API_CONFIG.ACCOUNT_ID).then((result) => {
      if (!isMounted) return;
      if (result.success && 'data' in result) {
        dispatch(bookmarkActions.setAccount(result.data));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const loadWatchlist = useCallback(() => {
    dispatch(bookmarkActions.setItems(watchlistStorage.getAll()));
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadWatchlist();
    }, [loadWatchlist])
  );

  const handlePressMovie = (movie: BookmarkMovie) => {
    navigation.navigate('MovieDetail', {
      movieId: Number(movie.id),
    });
  };

  const sortedMovies = useMemo(() => {
    const data = [...movies];
    data.sort((a, b) => {
      let result = 0;
      if (filterBy === 'rating') {
        result = a.rating - b.rating;
      } else {
        result = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      }
      return orderBy === 'asc' ? result : -result;
    });
    return data;
  }, [movies, filterBy, orderBy]);

  const handleRemove = (id: string) => {
    watchlistStorage.remove(id);
    dispatch(bookmarkActions.removeItem(id));
  };

  const toggleOrder = () => {
    dispatch(bookmarkActions.setOrderBy(orderBy === 'asc' ? 'desc' : 'asc'));
  };
  

  const renderHeader = () => {
    return (
      <>
        <Logo />

        <View style={styles.profileHeader}>
          <TouchableOpacity activeOpacity={0.8} style={styles.backButton}>
            <Text style={styles.backIcon}>{'‹'}</Text>
          </TouchableOpacity>

          <View style={styles.profileInfoRow}>
            {account?.avatar?.tmdb?.avatar_path ? (
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/w185${account.avatar.tmdb.avatar_path}`,
                }}
                style={styles.avatarImage}
              />
            ) : account?.avatar?.gravatar?.hash ? (
              <Image
                source={{
                  uri: `${gravatarBaseUrl}/${account.avatar.gravatar.hash}?s=84`,
                }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(account?.username || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <View style={styles.profileTextWrap}>
              <Text style={styles.profileName}>
                {account?.username ?? 'Guest'}
              </Text>
              <Text style={styles.profileSubText}>
                Member since August 2023
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Watchlist</Text>

          <View style={styles.filterRow}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Filter by:</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.filterValueWrap}
                onPress={() =>
                  dispatch(bookmarkActions.setFilterBy(filterBy === 'rating' ? 'date' : 'rating'))
                }
              >
                <Text style={styles.filterValue}>
                  {filterBy === 'rating' ? 'Rating' : 'Date Added'}
                </Text>
                <Text style={styles.filterArrow}>⌄</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.orderGroup}>
              <Text style={styles.filterLabel}>Order:</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.orderButton}
                onPress={toggleOrder}
              >
                <Text style={styles.orderIcon}>
                  {orderBy === 'asc' ? '↑' : '↓'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.container}>
        <AppFlashList
          data={sortedMovies}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <BookmarkCard
              item={item}
              onRemove={handleRemove}
              onPress={() => handlePressMovie(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>Empty watchlist</Text>
              <Text style={styles.emptySubTitle}>
                Add movies from their detail screen to see them here.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default BookmarkScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  listContent: {
    paddingBottom: 90,
  },

  logoContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -2,
  },

  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#48c7cf',
    letterSpacing: 1,
    lineHeight: 20,
  },

  logoPillSmall: {
    width: 24,
    height: 10,
    borderRadius: 8,
    backgroundColor: '#48c7cf',
    marginLeft: 5,
  },

  logoPillLarge: {
    width: 42,
    height: 10,
    borderRadius: 8,
    backgroundColor: '#48c7cf',
    marginLeft: 5,
  },

  profileHeader: {
    backgroundColor: '#022b4d',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
  },

  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 14,
    paddingRight: 8,
  },

  backIcon: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 28,
  },

  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#8d43f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 14,
  },

  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '500',
  },

  profileTextWrap: {
    flex: 1,
  },

  profileName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },

  profileSubText: {
    color: '#9ab0bf',
    fontSize: 13,
    marginTop: 4,
  },

  section: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
  },

  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1b1b1b',
    marginBottom: 14,
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  orderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterLabel: {
    fontSize: 14,
    color: '#979797',
    marginRight: 6,
  },

  filterValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterValue: {
    fontSize: 14,
    color: '#1eb6dd',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  filterArrow: {
    fontSize: 16,
    color: '#1eb6dd',
    marginLeft: 5,
  },

  orderButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },

  orderIcon: {
    fontSize: 18,
    color: '#111111',
    fontWeight: '700',
  },

  movieCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ececec',
    borderRadius: 4,
    padding: 10,
    marginHorizontal: 18,
    marginTop: 12,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  poster: {
    width: 56,
    height: 84,
    borderRadius: 2,
    backgroundColor: '#f1f1f1',
  },

  movieContent: {
    flex: 1,
    marginLeft: 12,
  },

  movieHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  movieTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1f1f1f',
    paddingRight: 8,
  },

  removeButton: {
    paddingHorizontal: 4,
    marginTop: -2,
  },

  removeIcon: {
    fontSize: 22,
    color: '#666666',
    lineHeight: 22,
  },

  movieDate: {
    marginTop: 2,
    fontSize: 12,
    color: '#9e9e9e',
  },

  movieOverview: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    color: '#2b2b2b',
  },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 80,
    minHeight: 280,
  },

  emptyTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f1f1f',
  },

  emptySubTitle: {
    marginTop: 12,
    fontSize: 16,
    color: '#8f8f8f',
    textAlign: 'center',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 62,
    backgroundColor: '#012b4f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 2,
  },

  bottomTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomIcon: {
    fontSize: 22,
    color: '#ffffff',
  },
});