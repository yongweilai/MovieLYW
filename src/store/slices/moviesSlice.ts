import type { MovieListItem } from '../../api/movieApi';

export type MoviesState = {
  ui: {
    search: string;
    appliedSearch: string;
    selectedCategory: string;
    selectedSort: string;
  };
  data: {
    rawMovies: MovieListItem[];
    page: number;
    totalPages: number;
  };
  status: {
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
  };
};

const initialMoviesState: MoviesState = {
  ui: {
    search: '',
    appliedSearch: '',
    selectedCategory: 'now_playing',
    selectedSort: 'sort_by',
  },
  data: {
    rawMovies: [],
    page: 1,
    totalPages: 1,
  },
  status: {
    loading: false,
    loadingMore: false,
    error: null,
  },
};

export const MOVIES_ACTIONS = {
  SET_UI: 'movies/setUi',
  SET_SEARCH: 'movies/setSearch',
  SET_APPLIED_SEARCH: 'movies/setAppliedSearch',
  SET_CATEGORY: 'movies/setCategory',
  SET_SORT: 'movies/setSort',
  SET_MOVIES_PAGE: 'movies/setMoviesPage',
  SET_MOVIES_LOADING: 'movies/setLoading',
  SET_MOVIES_LOADING_MORE: 'movies/setLoadingMore',
  SET_MOVIES_ERROR: 'movies/setError',
  SET_MOVIES: 'movies/setMovies',
  SET_TOTAL_PAGES: 'movies/setTotalPages',
  APPEND_MOVIES: 'movies/appendMovies',
  RESET_MOVIES_PAGINATION: 'movies/resetPagination',
} as const;

type SetUiAction = {
  type: typeof MOVIES_ACTIONS.SET_UI;
  payload: Partial<MoviesState['ui']>;
};
type SetSearchAction = { type: typeof MOVIES_ACTIONS.SET_SEARCH; payload: string };
type SetAppliedSearchAction = { type: typeof MOVIES_ACTIONS.SET_APPLIED_SEARCH; payload: string };
type SetCategoryAction = { type: typeof MOVIES_ACTIONS.SET_CATEGORY; payload: string };
type SetSortAction = { type: typeof MOVIES_ACTIONS.SET_SORT; payload: string };
type SetMoviesPageAction = { type: typeof MOVIES_ACTIONS.SET_MOVIES_PAGE; payload: number };
type SetTotalPagesAction = { type: typeof MOVIES_ACTIONS.SET_TOTAL_PAGES; payload: number };
type SetLoadingMoreAction = { type: typeof MOVIES_ACTIONS.SET_MOVIES_LOADING_MORE; payload: boolean };
type SetErrorAction = { type: typeof MOVIES_ACTIONS.SET_MOVIES_ERROR; payload: string | null };
type SetMoviesAction = { type: typeof MOVIES_ACTIONS.SET_MOVIES; payload: MovieListItem[] };
type AppendMoviesAction = { type: typeof MOVIES_ACTIONS.APPEND_MOVIES; payload: MovieListItem[] };
type ResetPaginationAction = { type: typeof MOVIES_ACTIONS.RESET_MOVIES_PAGINATION };

export type MoviesAction =
  | SetUiAction
  | SetSearchAction
  | SetAppliedSearchAction
  | SetCategoryAction
  | SetSortAction
  | SetMoviesPageAction
  | SetTotalPagesAction
  | { type: typeof MOVIES_ACTIONS.SET_MOVIES_LOADING; payload: boolean }
  | SetLoadingMoreAction
  | SetErrorAction
  | SetMoviesAction
  | AppendMoviesAction
  | ResetPaginationAction;

export function moviesReducer(state = initialMoviesState, action: MoviesAction): MoviesState {
  switch (action.type) {
    case MOVIES_ACTIONS.SET_UI:
      return {
        ...state,
        ui: { ...state.ui, ...action.payload },
      };
    case MOVIES_ACTIONS.SET_SEARCH:
      return { ...state, ui: { ...state.ui, search: action.payload } };
    case MOVIES_ACTIONS.SET_APPLIED_SEARCH:
      return { ...state, ui: { ...state.ui, appliedSearch: action.payload } };
    case MOVIES_ACTIONS.SET_CATEGORY:
      return { ...state, ui: { ...state.ui, selectedCategory: action.payload } };
    case MOVIES_ACTIONS.SET_SORT:
      return { ...state, ui: { ...state.ui, selectedSort: action.payload } };
    case MOVIES_ACTIONS.SET_MOVIES_PAGE:
      return { ...state, data: { ...state.data, page: action.payload } };
    case MOVIES_ACTIONS.SET_TOTAL_PAGES:
      return { ...state, data: { ...state.data, totalPages: action.payload } };
    case MOVIES_ACTIONS.SET_MOVIES_LOADING:
      return { ...state, status: { ...state.status, loading: action.payload } };
    case MOVIES_ACTIONS.SET_MOVIES_LOADING_MORE:
      return { ...state, status: { ...state.status, loadingMore: action.payload } };
    case MOVIES_ACTIONS.SET_MOVIES_ERROR:
      return { ...state, status: { ...state.status, error: action.payload } };
    case MOVIES_ACTIONS.SET_MOVIES:
      return { ...state, data: { ...state.data, rawMovies: action.payload } };
    case MOVIES_ACTIONS.APPEND_MOVIES:
      return {
        ...state,
        data: { ...state.data, rawMovies: [...state.data.rawMovies, ...action.payload] },
      };
    case MOVIES_ACTIONS.RESET_MOVIES_PAGINATION: {
      const data = { ...state.data, page: 1, totalPages: 1 };
      return { ...state, data };
    }
    default:
      return state;
  }
}

// Action creators
export const moviesActions = {
  setUi: (payload: Partial<MoviesState['ui']>): SetUiAction => ({
    type: MOVIES_ACTIONS.SET_UI,
    payload,
  }),
  setSearch: (payload: string): SetSearchAction => ({ type: MOVIES_ACTIONS.SET_SEARCH, payload }),
  setAppliedSearch: (payload: string): SetAppliedSearchAction => ({
    type: MOVIES_ACTIONS.SET_APPLIED_SEARCH,
    payload,
  }),
  setCategory: (payload: string): SetCategoryAction => ({
    type: MOVIES_ACTIONS.SET_CATEGORY,
    payload,
  }),
  setSort: (payload: string): SetSortAction => ({ type: MOVIES_ACTIONS.SET_SORT, payload }),
  setPage: (payload: number): SetMoviesPageAction => ({
    type: MOVIES_ACTIONS.SET_MOVIES_PAGE,
    payload,
  }),
  setTotalPages: (payload: number): SetTotalPagesAction => ({
    type: MOVIES_ACTIONS.SET_TOTAL_PAGES,
    payload,
  }),
  setLoading: (payload: boolean) => ({
    type: MOVIES_ACTIONS.SET_MOVIES_LOADING,
    payload,
  }),
  setLoadingMore: (payload: boolean) => ({
    type: MOVIES_ACTIONS.SET_MOVIES_LOADING_MORE,
    payload,
  }),
  setError: (payload: string | null) => ({
    type: MOVIES_ACTIONS.SET_MOVIES_ERROR,
    payload,
  }),
  setMovies: (payload: MovieListItem[]) => ({
    type: MOVIES_ACTIONS.SET_MOVIES,
    payload,
  }),
  appendMovies: (payload: MovieListItem[]) => ({
    type: MOVIES_ACTIONS.APPEND_MOVIES,
    payload,
  }),
  resetPagination: (): ResetPaginationAction => ({
    type: MOVIES_ACTIONS.RESET_MOVIES_PAGINATION,
  }),
};
