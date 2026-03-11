import { apiClient, ApiResponse } from './client';

// Types that match The Movie DB "list" response payload
// Example item shape is provided in the requirements.
export type MovieListItem = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult?: boolean;
  backdrop_path?: string | null;
  genre_ids?: number[];
  original_language?: string;
  original_title?: string;
  video?: boolean;
};

export type MovieListResponse = {
  page: number;
  results: MovieListItem[];
  total_pages: number;
  total_results: number;
};

// Detail response (simplified to the fields we use in UI)
export type MovieDetailResponse = {
  id: number;
  title: string;
  release_date: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  status: string;
  original_language: string;
  spoken_languages?: { english_name: string; iso_639_1: string; name: string }[];
  vote_average: number;
  tagline: string;
  overview: string;
  poster_path: string | null;
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
};

export type MovieCreditsResponse = {
  id: number;
  cast: CastMember[];
};

export type RecommendationItem = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average: number;
};

export type MovieRecommendationsResponse = {
  page: number;
  results: RecommendationItem[];
};

export type AccountDetailsResponse = {
  id: number;
  username: string;
  name: string;
  avatar: {
    gravatar: { hash: string };
    tmdb: { avatar_path: string | null };
  };
};

export const movieApi = {
  // Now Playing movies
  movieNowPlayingList(page = 1): Promise<ApiResponse<MovieListResponse>> {
    return apiClient.get<MovieListResponse>('/movie/now_playing', { page });
  },

  // Popular movies
  moviePopularList(page = 1): Promise<ApiResponse<MovieListResponse>> {
    return apiClient.get<MovieListResponse>('/movie/popular', { page });
  },

  // Upcoming movies
  movieUpcomingList(page = 1): Promise<ApiResponse<MovieListResponse>> {
    return apiClient.get<MovieListResponse>('/movie/upcoming', { page });
  },

  // Movie detail
  getMovieDetail(movieId: number): Promise<ApiResponse<MovieDetailResponse>> {
    return apiClient.get<MovieDetailResponse>(`/movie/${movieId}`);
  },
  // Movie credits
  getMovieCredits(movieId: number): Promise<ApiResponse<MovieCreditsResponse>> {
    return apiClient.get<MovieCreditsResponse>(`/movie/${movieId}/credits`);
  },

  getAccountDetails(
    accountId: number
  ): Promise<ApiResponse<AccountDetailsResponse>> {
    return apiClient.get<AccountDetailsResponse>(`/account/${accountId}`);
  },
  movieRecommendations(
    movieId: number
  ): Promise<ApiResponse<MovieRecommendationsResponse>> {
    return apiClient.get<MovieRecommendationsResponse>(
      `/movie/${movieId}/recommendations`
    );
  },
};