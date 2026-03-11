import type { AccountDetailsResponse } from '../../api/movieApi';
import type { WatchlistItem } from '../../storage/watchlistStorage';

export type BookmarkSortOrder = 'alphabetical' | 'rating' | 'release_date';

export type BookmarkState = {
  items: WatchlistItem[];
  account: AccountDetailsResponse | null;
  filter: {
    sortOrder: BookmarkSortOrder;
  };
};

const initialBookmarkState: BookmarkState = {
  items: [],
  account: null,
  filter: {
    sortOrder: 'alphabetical',
  },
};

export const BOOKMARK_ACTIONS = {
  SET_ITEMS: 'bookmark/setItems',
  SET_ACCOUNT: 'bookmark/setAccount',
  SET_FILTER: 'bookmark/setFilter',
  SET_SORT_ORDER: 'bookmark/setSortOrder',
  REMOVE_ITEM: 'bookmark/removeItem',
} as const;

export type BookmarkAction =
  | { type: typeof BOOKMARK_ACTIONS.SET_ITEMS; payload: WatchlistItem[] }
  | { type: typeof BOOKMARK_ACTIONS.SET_ACCOUNT; payload: AccountDetailsResponse | null }
  | { type: typeof BOOKMARK_ACTIONS.SET_FILTER; payload: Partial<BookmarkState['filter']> }
  | { type: typeof BOOKMARK_ACTIONS.SET_SORT_ORDER; payload: BookmarkSortOrder }
  | { type: typeof BOOKMARK_ACTIONS.REMOVE_ITEM; payload: string };

export function bookmarkReducer(state = initialBookmarkState, action: BookmarkAction): BookmarkState {
  switch (action.type) {
    case BOOKMARK_ACTIONS.SET_ITEMS:
      return { ...state, items: action.payload };
    case BOOKMARK_ACTIONS.SET_ACCOUNT:
      return { ...state, account: action.payload };
    case BOOKMARK_ACTIONS.SET_FILTER:
      return { ...state, filter: { ...state.filter, ...action.payload } };
    case BOOKMARK_ACTIONS.SET_SORT_ORDER:
      return { ...state, filter: { ...state.filter, sortOrder: action.payload } };
    case BOOKMARK_ACTIONS.REMOVE_ITEM:
      return { ...state, items: state.items.filter(item => item.id !== action.payload) };
    default:
      return state;
  }
}

export const bookmarkActions = {
  setItems: (payload: WatchlistItem[]) => ({ type: BOOKMARK_ACTIONS.SET_ITEMS, payload }),
  setAccount: (payload: AccountDetailsResponse | null) => ({
    type: BOOKMARK_ACTIONS.SET_ACCOUNT,
    payload,
  }),
  setFilter: (payload: Partial<BookmarkState['filter']>) => ({
    type: BOOKMARK_ACTIONS.SET_FILTER,
    payload,
  }),
  setSortOrder: (payload: BookmarkSortOrder) => ({
    type: BOOKMARK_ACTIONS.SET_SORT_ORDER,
    payload,
  }),
  removeItem: (payload: string) => ({ type: BOOKMARK_ACTIONS.REMOVE_ITEM, payload }),
};
