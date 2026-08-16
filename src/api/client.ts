const BASE_ENV_URL = import.meta.env.VITE_BACKEND_URL

if (!BASE_ENV_URL) {
  console.error("🚨 Vite Environment Variable VITE_BACKEND_URL is not defined! Check your .env file and restart your server.");
};

export const GLOBAL_BASE_URL = `${BASE_ENV_URL}/globaltrade-logistics-corporation/api`;

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};
