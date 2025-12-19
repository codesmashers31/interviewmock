// Dynamically determine the socket URL based on the current window location
// This allows the app to work seamlessly on both localhost and the local network IP
const hostname = window.location.hostname;
export const SOCKET_URL = "https://interviewmock.onrender.com";
export const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${hostname}:3000`;
