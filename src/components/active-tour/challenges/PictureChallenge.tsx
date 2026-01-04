import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import ActiveChallengeCard from '../ActiveChallengeCard';
import { uploadOptimizedImage } from '@/src/utils/imageUtils';

interface PictureChallengeProps {
    challenge: any;
    isCompleted: boolean;
    isFailed: boolean;
    onComplete: (challenge: any) => void;
    index: number;
    isBonus?: boolean;
}

const PictureChallenge: React.FC<PictureChallengeProps> = ({
    challenge,
    isCompleted,
    isFailed,
    onComplete,
    index,
    isBonus = false
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const isDone = isCompleted || isFailed;
    const [uploading, setUploading] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);

    const handlePress = async (): Promise<void> => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert(t('permissionNeeded'), t('cameraPermissionMsg') || "Camera access is needed to complete this challenge.");
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                // @ts-ignore - Expo types might be outdated, but runtime warning says to use MediaType
                mediaTypes: (ImagePicker as any).MediaType?.Images || ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5, // Compression as requested
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const capturedImage = result.assets[0];
                setImageUri(capturedImage.uri);
                setUploading(true);

                try {
                    // Upload using service (which ensures 600px width)
                    // Explicitly pass 'images' bucket and 'challenge-entries' folder
                    const publicUrl = await uploadOptimizedImage(capturedImage.uri, 'images', 'challenge-entries');

                    // Complete challenge with the URL
                    onComplete({ ...challenge, imageUrl: publicUrl });
                } catch (uploadError) {
                    console.error("Upload failed", uploadError);
                    Alert.alert("Upload Failed", "Could not upload your picture. Please try again.");
                    setImageUri(null); // Reset on failure
                } finally {
                    setUploading(false);
                }
            }
        } catch (error) {
            console.error("Camera error", error);
            Alert.alert("Error", "Could not open camera.");
        }
    };

    return (
        <ActiveChallengeCard
            title={challenge.title}
            points={challenge.points}
            type="camera"
            isCompleted={isCompleted}
            isFailed={isFailed}
            onPress={handlePress}
            actionLabel={uploading ? (t('uploading') || "Uploading...") : (t('takePhoto') || "Take Photo")}
            disabled={isDone || uploading}
            index={index}
            isBonus={isBonus}
        >
            <Text style={[styles.description, { color: theme.textPrimary }]}>
                {challenge.content}
            </Text>
            <View style={styles.content}>
                {uploading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={theme.primary} />
                        <Text style={{ color: theme.textSecondary, marginTop: 8 }}>{t('compressingAndUploading') || "Compressing & Uploading..."}</Text>
                    </View>
                )}

                {(imageUri || isCompleted) && !uploading && (
                    <View style={styles.placeholderImage}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        ) : (
                            <View style={{ alignItems: 'center' }}>
                                <Ionicons name="checkmark-circle" size={40} color={theme.success} />
                                <Text style={{ color: theme.textSecondary, marginTop: 4 }}>{t('photoUploaded') || "Photo Uploaded"}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </ActiveChallengeCard>
    );
};

const styles = StyleSheet.create({
    description: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    content: {
        marginBottom: 8,
    },
    instruction: {
        fontSize: 16,
        marginBottom: 12,
        fontStyle: 'italic',
    },
    placeholderImage: {
        height: 150,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        overflow: 'hidden',
    },
    loadingContainer: {
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    }
});

export default PictureChallenge;
