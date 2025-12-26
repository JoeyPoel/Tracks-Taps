import { supabase } from '@/utils/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Uploads an image to Supabase Storage.
 * 
 * 1. Manipulates the image to ensure it's a manageable size (max width 1080px) and compressed JPEG.
 * 2. Reads the file as a base64 string.
 * 3. Uploads the base64 data to Supabase Storage.
 * 4. Returns the public URL of the uploaded image.
 * 
 * @param uri Local URI of the image to upload
 * @param bucket Storage bucket name (default: 'images')
 * @param folder Folder path within the bucket (default: 'uploads')
 * @returns Promise resolving to the public URL of the uploaded image
 */
export const uploadImage = async (
    uri: string,
    bucket: string = 'images',
    folder: string = 'uploads'
): Promise<string> => {
    try {
        // 1. Manipulate Image: Resize and Compress
        // This ensures consistent performance and reduces bandwidth/storage usage.
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1080 } }], // Resize to max width 1080, height auto-scaled
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        const newUri = manipulatedImage.uri;

        // 2. Read file as Base64
        const base64 = await FileSystem.readAsStringAsync(newUri, {
            encoding: 'base64',
        });

        // Generate a unique file name
        const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

        // 3. Upload to Supabase
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, decode(base64), {
                contentType: 'image/jpeg',
                upsert: true,
            });

        if (error) {
            console.error("Supabase Storage Upload Error:", error);
            throw new Error(error.message);
        }

        // 4. Get Public URL
        const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;

    } catch (error) {
        console.error("Image Upload Service Error:", error);
        throw error;
    }
};
