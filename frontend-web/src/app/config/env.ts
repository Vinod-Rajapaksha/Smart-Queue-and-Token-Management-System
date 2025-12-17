export const env = {
  API_URL: import.meta.env.VITE_API_BASE_URL as string,
  SOCKET_URL: import.meta.env.VITE_SOCKET_BASE_URL as string | undefined,
};

if (!env.API_URL) {
  throw new Error("VITE_API_BASE_URL is missing in .env");
}
