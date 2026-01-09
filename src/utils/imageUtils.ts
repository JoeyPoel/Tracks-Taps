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
import * as FileSystem from 'expo-file-system/legacy';
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

    // 1. Identify if this is a Supabase Storage URL
    // These typically look like: https://[project].supabase.co/storage/v1/object/public/[bucket]/[file]
    const isSupabaseUrl = url.includes('supabase.co/storage/v1/object/public');

    if (isSupabaseUrl) {
        // 2. Switch to the Image Transformation Endpoint
        // We replace '/object/public/' with '/render/image/public/'.
        // This tells Supabase: "Don't just give me the file; process it first."
        let optimizedUrl = url.replace('/object/public/', '/render/image/public/');

        // 3. Add Transformation Parameters
        // Check if params already exist (rare, but good safety)
        const hasParams = optimizedUrl.includes('?');
        const separator = hasParams ? '&' : '?';

        // prevent duplicate parameters if called multiple times
        if (optimizedUrl.includes('width=')) {
            return optimizedUrl;
        }

        // 4. Append Settings
        // width={width}   -> specific size (e.g. 600px)
        // quality=60      -> compress to 60% quality (visually fine for mobile, huge savings)
        // resize=cover    -> ensures the image fills the dimensions without distortion
        let params = `width=${width}&quality=60`;

        if (options?.height) {
            params += `&height=${options.height}`;
        }

        // Default to 'contain' if not specified to prevent server-side cropping on resize
        // (unless height is provided, in which case we might want cover, but let caller decide)
        if (options?.resize) {
            params += `&resize=${options.resize}`;
        }

        return `${optimizedUrl}${separator}${params}`;
    }

    // Return original URL for non-Supabase images
    return url;
};
