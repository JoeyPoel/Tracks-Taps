/**
 * Optimizes Supabase Storage image URLs to reduce data usage (Egress).
 * 
 * PROBLEM: 
 * Standard Supabase URLs (ending in /object/public/...) serve the original, full-resolution file.
 * If a user uploads a 5MB photo, every user who sees it downloads 5MB. This causes high "Cached Egress".
 * 
 * SOLUTION:
 * We switch the URL to use Supabase's Image Transformation service (ending in /render/image/public/...).
 * This allows us to request a resized, compressed version (e.g., width=600, quality=60).
 * The server resizes it on the fly, sending ~50KB instead of 5MB.
 * 
 * @param url The original image URL
 * @param width The desired width in pixels (default 600 for mobile listing)
 * @returns The optimized URL
 */
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../../utils/supabase';

/**
 * Uploads an image to Supabase Storage with strict client-side optimization.
 * 
 * WHY:
 * Uploading raw camera photos (often 5Mb+) is slow and wastes user data/storage.
 * 
 * HOW:
 * 1. Resizes image to max width 800px (sufficient for mobile usage/listing).
 * 2. Compresses to JPEG quality 0.6 (good balance of size vs quality).
 * 3. Uploads via standard Supabase client.
 * 
 * @param uri Local file URI
 * @param bucket Target bucket (default 'images')
 * @param folder Target folder (default 'uploads')
 * @returns Public URL of the uploaded image
 */
export const uploadOptimizedImage = async (
    uri: string,
    bucket: string = 'images',
    folder: string = 'uploads'
): Promise<string> => {
    try {
        // 1. Client-Side Optimization (The Magic Step)
        // We force the image to be smaller BEFORE it leaves the phone.
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }], // Resize to 800px width (maintains aspect ratio)
            { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        );

        const newUri = manipulatedImage.uri;

        // 2. Read as Base64 for upload
        const base64 = await FileSystem.readAsStringAsync(newUri, {
            encoding: 'base64',
        });

        // 3. Generate unique path
        const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

        // 4. Upload to Supabase
        const { error } = await supabase.storage
            .from(bucket)
            .upload(fileName, decode(base64), {
                contentType: 'image/jpeg',
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }

        // 5. Retrieve Public URL
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        // 6. Return Optimized URL via our helper (Double optimization for viewing!)
        return getOptimizedImageUrl(data.publicUrl);

    } catch (error) {
        console.error("Optimized Upload Error:", error);
        throw error;
    }
};

export const getOptimizedImageUrl = (url: string, width: number = 600, options?: { height?: number, resize?: string }): string => {
    if (!url) return url;

    // 1. Check if it's a Supabase Render URL (Image Transformation)
    // We want to REVERT this to the standard /object/public/ URL because:
    // a) We already optimize images client-side before upload (see uploadOptimizedImage).
    // b) The /render/ endpoint can fail or be restricted on some plans/configurations.
    if (url.includes('supabase.co/storage/v1/render/image/public')) {
        const revertedUrl = url.replace('/render/image/public/', '/object/public/');
        // Allow removing query params if needed, but usually simply replacing the path works for the base file.
        // We strip query params to ensure we get the static file.
        return revertedUrl.split('?')[0];
    }

    // 2. If it's already a standard object URL, return it as is.
    // We do NOT want to convert it to /render/ anymore.
    if (url.includes('supabase.co/storage/v1/object/public')) {
        return url;
    }

    // 3. For any other URL (external, local, etc.), return as exists.
    return url;
};
