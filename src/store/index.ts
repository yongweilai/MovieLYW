import { createStore, combineReducers } from 'redux';
import { moviesReducer } from './slices/moviesSlice';
import { bookmarkReducer } from './slices/bookmarkSlice';
import { movieDetailReducer } from './slices/movieDetailSlice';

const rootReducer = combineReducers({
  movies: moviesReducer,
  bookmark: bookmarkReducer,
  movieDetail: movieDetailReducer,
});

export const store = createStore(rootReducer);

export type RootState = ReturnType<typeof rootReducer>;

export { moviesActions } from './slices/moviesSlice';
export { bookmarkActions } from './slices/bookmarkSlice';
export { movieDetailActions } from './slices/movieDetailSlice';
export type { MoviesState } from './slices/moviesSlice';
export type { BookmarkState } from './slices/bookmarkSlice';
export type { MovieDetailState } from './slices/movieDetailSlice';
