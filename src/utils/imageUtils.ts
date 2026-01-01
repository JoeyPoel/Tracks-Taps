export const getOptimizedImageUrl = (url: string, width: number = 600): string => {
    if (!url) return url;
    // Check if it's a Supabase Storage URL
    if (url.includes('supabase.co/storage/v1/object/public')) {
        // If it already has query params, assume handled or just append with &
        const separator = url.includes('?') ? '&' : '?';
        // Avoid double-width param if somehow present
        if (url.includes('width=')) return url;

        return `${url}${separator}width=${width}&quality=80`;
    }
    return url;
};
