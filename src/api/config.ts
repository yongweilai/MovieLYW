declare global {
    namespace NodeJS {
      interface ProcessEnv {
        MOVIE_DB_BEARER_TOKEN?: string;
      }
    }
  }
  
  /** Bearer token from .env (MOVIE_DB_BEARER_TOKEN). Do not commit .env. */
  const getToken = (): string => {
    const token = process.env.MOVIE_DB_BEARER_TOKEN;
    if (!token) {
      throw new Error(
        'MOVIE_DB_BEARER_TOKEN is missing. Add it to a .env file in the project root (see .env.example).'
      );
    }
    return token;
  };
  
  export const API_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    TIMEOUT: 10000,
    get TOKEN(): string {
      return getToken();
    },
    /** Account ID for /account/{id} details (username, avatar). Set to 0 to hide account section. */
    ACCOUNT_ID: 22863213,
  };