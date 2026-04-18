import { environment } from '../../../environments/environment';

const base = environment.apiUrl;

export const API_ROUTES = {
  AUTH: {
    SIGNUP: `${base}/users/signup`,
    LOGIN: `${base}/users/login`,
  },
  SOCIETY: {
    AMENITIES: `${base}/amenities`,
    BOOKINGS: `${base}/bookings`,
  },
  // Add more as the housing society app grows
};