import type { Movie } from '../../navigator/types';
import type { CastMember, RecommendationItem } from '../../api/movieApi';

export type MovieDetailState = {
  movie: Movie | null;
  cast: CastMember[];
  recommendations: RecommendationItem[];
};

const initialState: MovieDetailState = {
  movie: null,
  cast: [],
  recommendations: [],
};

export const MOVIE_DETAIL_ACTIONS = {
  SET_DETAIL: 'movieDetail/setDetail',
  CLEAR_DETAIL: 'movieDetail/clearDetail',
} as const;

export type MovieDetailAction =
  | {
      type: typeof MOVIE_DETAIL_ACTIONS.SET_DETAIL;
      payload: {
        movie: Movie;
        cast: CastMember[];
        recommendations: RecommendationItem[];
      };
    }
  | { type: typeof MOVIE_DETAIL_ACTIONS.CLEAR_DETAIL };

export function movieDetailReducer(
  state = initialState,
  action: MovieDetailAction
): MovieDetailState {
  switch (action.type) {
    case MOVIE_DETAIL_ACTIONS.SET_DETAIL:
      return {
        movie: action.payload.movie,
        cast: action.payload.cast,
        recommendations: action.payload.recommendations,
      };
    case MOVIE_DETAIL_ACTIONS.CLEAR_DETAIL:
      return initialState;
    default:
      return state;
  }
}

export const movieDetailActions = {
  setDetail: (payload: {
    movie: Movie;
    cast: CastMember[];
    recommendations: RecommendationItem[];
  }) => ({ type: MOVIE_DETAIL_ACTIONS.SET_DETAIL, payload }),
  clearDetail: () => ({ type: MOVIE_DETAIL_ACTIONS.CLEAR_DETAIL }),
};
