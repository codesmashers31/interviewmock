import { API_BASE_URL } from '../config';

/**
 * Generates the full profile image URL.
 * 
 * @param path - The image path from the database (e.g., "/uploads/..." or "http://...")
 * @returns The full URL to the image, or a default fallback if invalid.
 */
export const getProfileImageUrl = (path?: string | null): string => {
    if (!path) {
        return '/mocki_log.png';
    }

    // If it's already a full URL (including UI avatars or external links), return it
    if (path.startsWith('http')) {
        // If it's one of our uploaded images (contains /uploads/), rebase it to current API_BASE_URL
        // This fixes port mismatches (3000 vs 5000) and domain mismatches (render vs localhost)
        if (path.includes('/uploads/')) {
            const relativePath = path.substring(path.indexOf('/uploads/'));
            return `${API_BASE_URL}${relativePath}`;
        }
        return path;
    }

    // If it's a relative path (starts with /), append to API_BASE_URL
    if (path.startsWith('/')) {
        return `${API_BASE_URL}${path}`;
    }

    // Fallback for unexpected formats, try to treat as relative path
    return `${API_BASE_URL}/${path}`;
};
