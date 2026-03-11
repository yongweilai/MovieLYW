export type Movie = {
    id: string;
    title: string;
    year: string;
    releaseDate: string;
    runtime: string;
    genres: string;
    status: string;
    originalLanguage: string;
    userScore: number;
    director: string;
    writer: string;
    tagline: string;
    overview: string;
    poster: string;
};

export type HomeStackParamList = {
    HomeMain: undefined;
    MovieDetail: {
        movieId: number;
    };
};

export type BookmarkStackParamList = {
    BookmarkMain: undefined;
    MovieDetail: {
        movieId: number;
    };
};

export type RootTabParamList = {
    HomeTab: undefined;
    BookmarkTab: undefined;
};

export type MovieItem = {
    id: string;
    title: string;
    releaseDate: string;
    overview: string;
    poster: string;
};

export type RootStackParamList = {
    MovieHome: undefined;
    MovieDetail: {
        movieId: number;
    };
};
