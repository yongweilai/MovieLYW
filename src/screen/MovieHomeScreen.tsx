import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, MovieItem } from '../navigator/types';
import CategoryDropdown from '../components/CategoryDropdown';
import { movieApi, MovieListItem } from '../api/movieApi';
import AppLogoTheMovieDb from '../assets/app_logo_the_movie_db.svg';
type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

const categoryOptions = [
  { label: 'Now Playing', value: 'now_playing' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Popular', value: 'popular' },
];

const sortOptions = [
  { label: 'By alphabetical order', value: 'sort_by' },
  { label: 'By rating', value: 'by_rating' },
  { label: 'By release date', value: 'by_release_date' },
];

const Logo = () => {
  return (
    <View style={styles.logoContainer}>
      <AppLogoTheMovieDb width={100} height={100} />
    </View>
  );
};

const DropdownCard = ({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.dropdownCard} onPress={onPress}>
      <Text style={styles.dropdownText}>{label}</Text>
      <Text style={styles.chevron}>{'›'}</Text>
    </TouchableOpacity>
  );
};

const MovieCard = ({
  item,
  onPress,
}: {
  item: MovieItem;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.movieCard} onPress={onPress}>
      <Image source={{ uri: item.poster }} style={styles.poster} resizeMode="cover" />
      <View style={styles.movieContent}>
        <Text style={styles.movieTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.movieDate}>{item.releaseDate}</Text>
        <Text style={styles.movieOverview} numberOfLines={3}>
          {item.overview}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const MovieHomeScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('now_playing');
  const [selectedSort, setSelectedSort] = useState('sort_by');
  const [rawMovies, setRawMovies] = useState<MovieListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchPress = () => {
    setAppliedSearch(search.trim());
  };

  const mapToMovieItem = (item: MovieListItem): MovieItem => {
    const posterBaseUrl = 'https://image.tmdb.org/t/p/w500';
    return {
      id: String(item.id),
      title: item.title,
      releaseDate: item.release_date,
      overview: item.overview,
      poster: item.poster_path ? `${posterBaseUrl}${item.poster_path}` : '',
    };
  };

  const processedMovies: MovieItem[] = useMemo(() => {
    let data = [...rawMovies];

    const keyword = appliedSearch.toLowerCase();
    if (keyword) {
      data = data.filter(movie => {
        const title = movie.title?.toLowerCase() ?? '';
        const overview = movie.overview?.toLowerCase() ?? '';
        return title.includes(keyword) || overview.includes(keyword);
      });
    }

    data.sort((a, b) => {
      switch (selectedSort) {
        case 'by_rating':
          // Higher rating first
          return (b.vote_average ?? 0) - (a.vote_average ?? 0);
        case 'by_release_date': {
          const aTime = new Date(a.release_date).getTime();
          const bTime = new Date(b.release_date).getTime();
          return bTime - aTime; // Newest first
        }
        case 'sort_by':
        default:
          // Alphabetical by title (A → Z)
          return a.title.localeCompare(b.title);
      }
    });

    return data.map(mapToMovieItem);
  }, [rawMovies, appliedSearch, selectedSort]);

  const handlePressMovie = (movie: MovieItem) => {
    navigation.navigate('MovieDetail', { movieId: Number(movie.id) });
  };

  const fetchMoviesByCategory = async (category: string) => {
    setLoading(true);
    setError(null);

    try {
      let result;
      if (category === 'popular') {
        result = await movieApi.moviePopularList();
      } else if (category === 'upcoming') {
        result = await movieApi.movieUpcomingList();
      } else {
        result = await movieApi.movieNowPlayingList();
      }

      if (result.success) {
        setRawMovies(result.data.results ?? []);
      } else {
        setError(result.message || 'Failed to load movies');
        setRawMovies([]);
      }
    } catch (e) {
      setError('Failed to load movies');
      setRawMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesByCategory(selectedCategory);
  }, [selectedCategory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <FlatList
          data={processedMovies}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <Logo />

              <CategoryDropdown
                options={categoryOptions}
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
              <CategoryDropdown
                options={sortOptions}
                value={selectedSort}
                onChange={setSelectedSort}
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search..."
                placeholderTextColor="#9b9b9b"
                style={styles.searchInput}
              />

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.searchButton,
                  search.trim().length > 0 && styles.searchButtonActive,
                ]}
                onPress={handleSearchPress}
                disabled={search.trim().length === 0}
              >
                <Text
                  style={[
                    styles.searchButtonText,
                    search.trim().length > 0 && styles.searchButtonTextActive,
                  ]}
                >
                  Search
                </Text>
              </TouchableOpacity>
              {loading && (
                <Text style={{ marginBottom: 8, color: '#666666' }}>
                  Loading movies...
                </Text>
              )}
              {error && (
                <Text style={{ marginBottom: 8, color: '#cc0000' }}>
                  {error}
                </Text>
              )}
            </>
          }
          renderItem={({ item }) => (
            <MovieCard
              item={item}
              onPress={() => handlePressMovie(item)}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default MovieHomeScreen;

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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 90,
  },

  logoContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },

  dropdownCard: {
    height: 52,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 4,
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dropdownText: {
    fontSize: 15,
    color: '#2d2d2d',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 24,
    color: '#2d2d2d',
    lineHeight: 24,
  },

  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 4,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#ffffff',
    marginBottom: 12,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchButton: {
    height: 50,
    borderRadius: 24,
    backgroundColor: '#dddddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  searchButtonActive: {
    backgroundColor: '#1BA3C6',
  },
  searchButtonText: {
    fontSize: 15,
    color: '#7f7f7f',
    fontWeight: '700',
  },
  searchButtonTextActive: {
    color: '#ffffff',
  },

  movieCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ececec',
    borderRadius: 4,
    padding: 10,
    marginBottom: 14,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  poster: {
    width: 62,
    height: 92,
    borderRadius: 2,
    backgroundColor: '#f1f1f1',
  },
  movieContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'flex-start',
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f1f1f',
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