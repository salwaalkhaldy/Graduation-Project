/**
 * Environment configuration for Smart Delivery Platform
 */

// Default to true for browser-only mock mode; can be toggled via environment or demo panel
export const USE_MOCK_API: boolean =
  import.meta.env.VITE_USE_MOCK_API !== undefined
    ? import.meta.env.VITE_USE_MOCK_API === 'true'
    : true;

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const GOOGLE_MAPS_API_KEY: string =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCaTazOGUyFoJWi7jDRF8IZgVVmTq6QYqY';
