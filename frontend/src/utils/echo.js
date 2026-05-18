import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { API_URL } from './constants';

window.Pusher = Pusher;

// We wrap the instantiation in a function so it can be re-initialized when the token changes
export const initEcho = () => {
  const token = localStorage.getItem('casebridge_token');
  
  if (!token) return null;

  return new Echo({
    broadcaster: 'reverb',
    // In Vite, we'd normally use import.meta.env, but for local dev we can hardcode or fallback:
    key: import.meta.env.VITE_REVERB_APP_KEY || 'casebridge-key',
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    // Use the backend broadcast auth endpoint explicitly
    authEndpoint: `${API_URL.replace('/api', '')}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });
};

export default initEcho;
