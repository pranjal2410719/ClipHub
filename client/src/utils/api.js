// Determine the API base URL dynamically
export const isLocal = import.meta.env.MODE === 'standalone';

// When running locally, allow phone to access node API by dynamically pointing to window host
// instead of hardcoded localhost
export const API_URL = isLocal 
  ? `http://${window.location.hostname}:5001` 
  : (import.meta.env.VITE_API_URL || "https://api.cliphub.app");
export const SOCKET_URL = API_URL;
