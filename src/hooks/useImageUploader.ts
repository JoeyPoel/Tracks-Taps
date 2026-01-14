import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { uploadOptimizedImage } from '../utils/imageUtils';

interface UseImageUploaderProps {
    initialImage?: string;
    folder?: string;
    onUploadComplete?: (url: string) => void;
    variant?: 'standard' | 'avatar';
}

export const useImageUploader = ({
    initialImage,
    folder = 'uploads',
    onUploadComplete,
    variant = 'standard'
}: UseImageUploaderProps) => {
    const [image, setImage] = useState<string | null>(initialImage || null);
    const [uploading, setUploading] = useState(false);
    const { t } = useLanguage();

    // Sync state with prop (for when data loads async)
    useEffect(() => {
        if (initialImage !== undefined) {
            setImage(initialImage || null);
        }
    }, [initialImage]);

    const isAvatar = variant === 'avatar';

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('permissionNeeded'), t('cameraPermissionMsg'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: isAvatar ? [1, 1] : [16, 9],
            quality: 1,
        });

        if (!result.canceled && result.assets[0].uri) {
            handleUpload(result.assets[0].uri);
        }
    };

    const handleUpload = async (uri: string) => {
        try {
            setUploading(true);
            setImage(uri); // Optimistic update

            // Use the optimized upload utility
            const publicUrl = await uploadOptimizedImage(uri, 'images', folder);

            if (onUploadComplete) {
                onUploadComplete(publicUrl);
            }
            setImage(publicUrl);
        } catch (error) {
            Alert.alert(t('uploadFailed'), t('uploadErrorMsg'));
            console.error(error);
            // Revert on failure if needed, but for now we keep the local uri or null
            // For better UX we might want to revert to initialImage or null here? 
            // But current implementation just leaves it (maybe showing error state is enough)
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setImage(null);
        if (onUploadComplete) {
            onUploadComplete('');
        }
    };

    return {
        image,
        uploading,
        pickImage,
        removeImage,
        setImage // Expose if needed for manual sets
    };
};
