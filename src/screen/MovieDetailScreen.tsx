import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, Movie } from '../navigator/types';
import {
  movieApi,
  MovieDetailResponse,
  CastMember,
  RecommendationItem,
} from '../api/movieApi';
import { watchlistStorage, WatchlistItem } from '../storage/watchlistStorage';

type Props = NativeStackScreenProps<HomeStackParamList, 'MovieDetail'>;

const posterBaseUrl = 'https://image.tmdb.org/t/p/w500';
const profileBaseUrl = 'https://image.tmdb.org/t/p/w185';

const formatRuntime = (runtime: number | null): string => {
  if (!runtime || runtime <= 0) {
    return 'N/A';
  }
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  if (!hours) {
    return `${minutes}m`;
  }
  if (!minutes) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
};

const mapDetailToMovie = (detail: MovieDetailResponse): Movie => {
  const year = detail.release_date ? detail.release_date.slice(0, 4) : '';
  const genres = detail.genres?.map(g => g.name).join(', ') || '';
  const primaryLanguage =
    detail.spoken_languages && detail.spoken_languages.length > 0
      ? detail.spoken_languages[0].english_name
      : detail.original_language;

  const userScore = Math.round((detail.vote_average || 0) * 10);

  return {
    id: String(detail.id),
    title: detail.title,
    year,
    releaseDate: detail.release_date,
    runtime: formatRuntime(detail.runtime),
    genres,
    status: detail.status,
    originalLanguage: primaryLanguage,
    userScore,
    // Credits (director / writer) can be filled when API provides them
    director: '',
    writer: '',
    tagline: detail.tagline,
    overview: detail.overview,
    poster: detail.poster_path ? `${posterBaseUrl}${detail.poster_path}` : '',
  };
};

function movieToWatchlistItem(movie: Movie): WatchlistItem {
  return {
    id: movie.id,
    title: movie.title,
    releaseDate: movie.releaseDate,
    overview: movie.overview,
    poster: movie.poster,
    rating: movie.userScore / 10,
    addedAt: new Date().toISOString().slice(0, 10),
  };
}

export default function MovieDetailScreen({ route, navigation }: Props) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    []
  );

  useEffect(() => {
    let isMounted = true;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detailResult, creditsResult, recsResult] = await Promise.all([
          movieApi.getMovieDetail(movieId),
          movieApi.getMovieCredits(movieId),
          movieApi.movieRecommendations(movieId),
        ]);

        if (!isMounted) return;

        if (detailResult.success) {
          const mapped = mapDetailToMovie(detailResult.data);
          setMovie(mapped);
          setIsBookmarked(watchlistStorage.isInWatchlist(mapped.id));
        } else {
          setError(detailResult.message || 'Failed to load movie detail');
        }

        if (creditsResult.success && creditsResult.data.cast) {
          setCast(creditsResult.data.cast);
        }
        if (recsResult.success && recsResult.data.results) {
          setRecommendations(recsResult.data.results);
        }
      } catch (e) {
        if (!isMounted) return;
        setError('Failed to load movie detail');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [movieId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#ffffff' }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !movie) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}
        >
          <Text style={{ color: '#ffffff', marginBottom: 12 }}>
            {error || 'Movie not found'}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text
              style={{
                color: '#ffffff',
                textDecorationLine: 'underline',
              }}
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {movie.title} ({movie.year})
          </Text>
        </View>

        {/* TOP INFO */}
        <View style={styles.topSection}>
          <Image source={{ uri: movie.poster }} style={styles.poster} />

          <View style={styles.topInfo}>
            <Text style={styles.rating}>PG13</Text>

            <Text style={styles.text}>
              {movie.releaseDate} • {movie.runtime}
            </Text>

            <Text style={styles.text}>{movie.genres}</Text>
            <Text style={styles.text}>Status: {movie.status}</Text>
            <Text style={styles.text}>
              Original Language: {movie.originalLanguage}
            </Text>
          </View>
        </View>

        {/* SCORE */}
        <View style={styles.scoreSection}>
          <View style={styles.circle}>
            <Text style={styles.score}>{movie.userScore}%</Text>
          </View>
          <Text style={styles.scoreLabel}>User Score</Text>

          <View style={styles.crew}>
            {movie.director ? (
              <>
                <Text style={styles.crewName}>{movie.director}</Text>
                <Text style={styles.crewRole}>Director</Text>
              </>
            ) : null}
            {movie.writer ? (
              <>
                <Text style={styles.crewName}>{movie.writer}</Text>
                <Text style={styles.crewRole}>Writer</Text>
              </>
            ) : null}
          </View>
        </View>

        {/* TAGLINE */}
        <Text style={styles.tagline}>{movie.tagline}</Text>

        {/* OVERVIEW */}
        <Text style={styles.overviewTitle}>Overview</Text>
        <Text style={styles.overview}>{movie.overview}</Text>

        {/* WATCHLIST */}
        <TouchableOpacity
          style={styles.watchlistButton}
          onPress={() => {
            if (!movie) return;
            if (isBookmarked) {
              watchlistStorage.remove(movie.id);
              setIsBookmarked(false);
            } else {
              watchlistStorage.add(movieToWatchlistItem(movie));
              setIsBookmarked(true);
            }
          }}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color="#fff"
          />
          <Text style={styles.watchlistText}>
            {isBookmarked ? ' Remove from Watchlist' : ' Add To Watchlist'}
          </Text>
        </TouchableOpacity>

        {/* WHITE SECTION: Top Billed Cast + Recommendation */}
        <View style={styles.whiteSection}>
          {/* Top Billed Cast */}
          <Text style={styles.sectionTitle}>Top Billed Cast</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.castList}
          >
            {cast.map((member) => (
              <View key={member.id} style={styles.castCard}>
                <Image
                  source={{
                    uri: member.profile_path
                      ? `${profileBaseUrl}${member.profile_path}`
                      : undefined,
                  }}
                  style={styles.castPhotoRect}
                />
                <Text style={styles.castName} numberOfLines={2}>
                  {member.name}
                </Text>
                <Text style={styles.castCharacter} numberOfLines={1}>
                  {member.character}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Recommendation */}
          <View style={styles.recSection}>
            <Text style={styles.sectionTitle}>Recommendation</Text>
            <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recList}
          >
            {recommendations.map((rec) => (
              <TouchableOpacity
                key={rec.id}
                style={styles.recCard}
                onPress={() =>
                  navigation.push('MovieDetail', { movieId: rec.id })
                }
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri: rec.poster_path
                      ? `${posterBaseUrl}${rec.poster_path}`
                      : undefined,
                  }}
                  style={styles.recPosterRect}
                />
                <Text style={styles.recTitle} numberOfLines={2}>
                  {rec.title}
                </Text>
                <Text style={styles.recScore}>
                  {Math.round(rec.vote_average * 10)}%
                </Text>
              </TouchableOpacity>
            ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#1BA3C6',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  topSection: {
    flexDirection: 'row',
    padding: 20,
  },

  poster: {
    width: 110,
    height: 160,
    borderRadius: 6,
  },

  topInfo: {
    marginLeft: 15,
    flex: 1,
  },

  rating: {
    color: '#fff',
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },

  text: {
    color: '#fff',
    marginBottom: 4,
  },

  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#00e676',
    justifyContent: 'center',
    alignItems: 'center',
  },

  score: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  scoreLabel: {
    color: '#fff',
    marginLeft: 10,
  },

  crew: {
    marginLeft: 40,
  },

  crewName: {
    color: '#fff',
    fontWeight: 'bold',
  },

  crewRole: {
    color: '#ddd',
    marginBottom: 8,
  },

  tagline: {
    color: '#fff',
    fontStyle: 'italic',
    padding: 20,
  },

  overviewTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },

  overview: {
    color: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  watchlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    margin: 20,
    padding: 12,
    justifyContent: 'center',
    borderRadius: 6,
  },

  watchlistText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  whiteSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingBottom: 32,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  castList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  castCard: {
    width: 120,
    marginHorizontal: 4,
    alignItems: 'center',
  },

  castPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
  },

  castPhotoRect: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },

  castName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
    textAlign: 'center',
  },

  castCharacter: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },

  recSection: {
    marginTop: 24,
  },

  recList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  recCard: {
    width: 120,
    marginHorizontal: 4,
  },

  recPoster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },

  recPosterRect: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },

  recTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginTop: 6,
  },

  recScore: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});